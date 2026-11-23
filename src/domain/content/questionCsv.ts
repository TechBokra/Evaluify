/**
 * CSV ingestion for synthetic local question bank drafts only.
 * All imported items require explicit teacher review before approval.
 */
export type CsvQuestionType = 'multiple-choice' | 'multiple-select' | 'true-false';
export type RightsBasis = 'original' | 'licensed' | 'open-license';

export interface CsvQuestionDraft {
  text: string;
  type: CsvQuestionType;
  correctAnswer: string | string[];
  options: string[];
  points: number;
  category: string;
  subCategory: string;
  tags: string[];
  skillTags: string[];
  rightsBasis: RightsBasis;
  sourceTitle?: string;
}

function csvRows(content: string): string[][] {
  if (content.length > 150_000) throw new Error('CSV is too large for the local importer');
  const source = content.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let afterQuote = false;

  const addRow = () => {
    row.push(field);
    if (row.some(value => value.trim() !== '')) rows.push(row);
    row = [];
    field = '';
    afterQuote = false;
  };

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
          afterQuote = true;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === ',' || char === '\n' || char === '\r') {
      if (char === ',') {
        row.push(field);
        field = '';
      } else {
        addRow();
        if (char === '\r' && source[i + 1] === '\n') i++;
      }
    } else if (char === '"' && field.length === 0 && !afterQuote) {
      quoted = true;
    } else if (afterQuote && char === ' ') {
      continue;
    } else if (afterQuote || char === '"') {
      throw new Error('Invalid CSV quoting near record ' + (rows.length + 1));
    } else {
      field += char;
    }
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  if (row.length > 0 || field.length > 0) addRow();
  return rows;
}

const splitPipe = (text: string): string[] =>
  text.split('|').map(value => value.trim()).filter(Boolean);

const validHeaders = [
  'text', 'type', 'correct_answer', 'options', 'points',
  'category', 'sub_category', 'rights_basis',
];

export function parseQuestionsCsv(content: string): CsvQuestionDraft[] {
  const rows = csvRows(content);
  if (rows.length < 2) throw new Error('CSV must have a header and at least one question');
  if (rows.length > 51) throw new Error('Import at most 50 questions per batch');
  const header = rows[0].map(value => value.trim().toLowerCase());
  if (new Set(header).size !== header.length) throw new Error('Duplicate CSV column');
  for (const field of validHeaders) {
    if (!header.includes(field)) throw new Error('Missing CSV column: ' + field);
  }

  const drafts: CsvQuestionDraft[] = [];
  for (const [index, values] of rows.slice(1).entries()) {
    const rowNumber = index + 2;
    if (values.length !== header.length) throw new Error('Record ' + rowNumber + ': wrong number of fields');
    const get = (name: string) => values[header.indexOf(name)]?.trim() ?? '';
    const text = get('text');
    const rawType = get('type');
    const type = rawType as CsvQuestionType;
    const points = Number(get('points'));
    const category = get('category');
    const subCategory = get('sub_category');
    const options = splitPipe(get('options'));
    const rawAnswer = get('correct_answer');
    const rightsBasis = get('rights_basis') as RightsBasis;
    const sourceTitle = get('source_title') || undefined;

    if (text.length < 5 || !category || !subCategory) {
      throw new Error('Record ' + rowNumber + ': question text, category, and subcategory required');
    }
    if (!Number.isInteger(points) || points < 1 || points > 100) {
      throw new Error('Record ' + rowNumber + ': points must be 1–100');
    }
    if (!['multiple-choice', 'multiple-select', 'true-false'].includes(type)) {
      throw new Error('Record ' + rowNumber + ': unsupported question type');
    }
    if (!['original', 'licensed', 'open-license'].includes(rightsBasis)) {
      throw new Error('Record ' + rowNumber + ': explicit rights basis is required');
    }
    if (rightsBasis !== 'original' && !sourceTitle) {
      throw new Error('Record ' + rowNumber + ': include source_title for third-party material');
    }
    if (type !== 'true-false') {
      if (options.length < 2 || new Set(options).size !== options.length) {
        throw new Error('Record ' + rowNumber + ': at least two unique options required');
      }
    }
    let correctAnswer: string | string[];
    if (type === 'true-false') {
      if (!['True', 'False'].includes(rawAnswer)) throw new Error('Record ' + rowNumber + ': True/False key required');
      correctAnswer = rawAnswer;
    } else if (type === 'multiple-select') {
      const selected = splitPipe(rawAnswer);
      if (!selected.length || new Set(selected).size !== selected.length || selected.some(value => !options.includes(value))) {
        throw new Error('Record ' + rowNumber + ': invalid multiple-select answer');
      }
      correctAnswer = selected;
    } else {
      if (!options.includes(rawAnswer)) throw new Error('Record ' + rowNumber + ': answer must match an option');
      correctAnswer = rawAnswer;
    }

    drafts.push({
      text, type, correctAnswer, options: type === 'true-false' ? ['True', 'False'] : options,
      points, category, subCategory,
      rightsBasis, sourceTitle,
      tags: splitPipe(get('tags')), skillTags: splitPipe(get('skills')),
    });
  }
  return drafts;
}
