/**
 * Local prototype boundary for a deferred interview feature.
 *
 * No provider SDK is initialized in the browser and no credentials are read.
 * This intentionally fails closed until a server-side provider gateway is
 * approved and tested in a later project phase.
 */
type GenerateContentParams = { model: string; contents: string };

const ai = {
  models: {
    async generateContent(_request: GenerateContentParams): Promise<{ text?: string }> {
      throw new Error('Live AI is disabled for the Evaluify local technical prototype.');
    },
    async *generateContentStream(_request: GenerateContentParams): AsyncGenerator<{ text: string }> {
      throw new Error('Live AI is disabled for the Evaluify local technical prototype.');
    },
  },
};

export default ai;
