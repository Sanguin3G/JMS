import { describe, expect, it } from 'vitest';
import { parseMatchingExplanation } from './matching-explanation';
describe('historical matching evidence', () => {
  it('preserves provider metadata and deterministic evidence across old and new serialization', () => {
    expect(parseMatchingExplanation('{"DeterministicScore":61,"Provider":"openai","Summary":"Evidence","Gaps":["Angular"]}'))
      .toMatchObject({ deterministicScore: 61, provider: 'openai', summary: 'Evidence', gaps: ['Angular'] });
    expect(parseMatchingExplanation({ deterministicScore: 24 })).toMatchObject({ deterministicScore: 24 });
  });
  it('ignores malformed historical explanation data', () => {
    expect(parseMatchingExplanation('not JSON')).toBeNull();
    expect(parseMatchingExplanation('[]')).toBeNull();
  });
});
