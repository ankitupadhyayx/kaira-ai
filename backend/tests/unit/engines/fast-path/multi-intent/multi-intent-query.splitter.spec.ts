import { MultiIntentQuerySplitter } from '../../../../../src/engines/fast-path/multi-intent/splitter/multi-intent-query.splitter';

describe('MultiIntentQuerySplitter (Stage 6.8)', () => {
  let splitter: MultiIntentQuerySplitter;

  beforeEach(() => {
    splitter = new MultiIntentQuerySplitter();
  });

  test('should split multi-clause queries using conjunctions and punctuation', () => {
    const query = 'Who is the CEO and where is your Delhi HQ office?';
    const segments = splitter.splitQuery(query);

    expect(segments.length).toBe(2);
    expect(segments[0].cleanSegmentText).toBe('Who is the CEO');
    expect(segments[1].cleanSegmentText).toBe('where is your Delhi HQ office');
  });

  test('should handle punctuation delimiters like question marks and periods', () => {
    const query = 'Tell me about Mobiloitte. Where is your headquarters?';
    const segments = splitter.splitQuery(query);

    expect(segments.length).toBe(2);
    expect(segments[0].cleanSegmentText).toBe('Tell me about Mobiloitte');
    expect(segments[1].cleanSegmentText).toBe('Where is your headquarters');
  });

  test('should return single segment for simple queries without conjunctions', () => {
    const query = 'Who is the CEO of Mobiloitte';
    const segments = splitter.splitQuery(query);

    expect(segments.length).toBe(1);
    expect(segments[0].cleanSegmentText).toBe('Who is the CEO of Mobiloitte');
  });
});
