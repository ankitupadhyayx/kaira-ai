import { GibberishEngine } from '../../../../src/engines/gibberish/services/gibberish.engine';
import { PipelineOrchestrator } from '../../../../src/normalization/pipeline-orchestrator/pipeline.orchestrator';

describe('Enterprise Gibberish Engine — 500+ Comprehensive Test Suite', () => {
  let engine: GibberishEngine;
  let pipeline: PipelineOrchestrator;

  beforeAll(() => {
    engine = new GibberishEngine();
    pipeline = new PipelineOrchestrator();
  });

  const processQuery = (raw: string) => {
    const context = pipeline.process(raw);
    return engine.process(context);
  };

  // Category 1: Keyboard Mash (50 cases)
  describe('Category 1: Keyboard Mash Detections', () => {
    const mashCases = [
      'asdfgh', 'qwerty', 'zxcvbn', 'poiuy', 'lkjhg', 'qazwsx', 'plmokn', '123asdf',
      'asdfghjkl', 'qwertyuiop', 'zxcvbnm', 'lkjhgfdsa', 'mnbvcxz', 'poiuytrewq',
      'qawsedrft', 'azsxdcfvb', 'tgbnhyujm', 'ikmolp', 'qweasdzxc', 'rfvtgbyhn',
      'ujmikolp', '123qweasdzxc', 'asdf123ghjk', 'qwert123yuiop', 'zxcv123bnm',
      'asdfghjkl;', 'qwertyuiop[', 'zxcvbnm,./', '123456asdfgh', 'asdfgh456789',
      'qweqweasdasd', 'zxczxcasdasd', 'asdfasdfghjghj', 'qwqwqweasdasd', 'zxzxzxcvbnmbnm',
      'asdfg', 'qwert', 'zxcvb', 'poiuy', 'lkjhg', 'qazws', 'edcrf', 'vtgby', 'hnujm', 'ikolp',
      'asdfghjk', 'qwertyui', 'zxcvbnm,', 'poiuytre', 'lkjhgfd'
    ];

    mashCases.forEach((input) => {
      it(`should detect keyboard mash: "${input}"`, () => {
        const res = processQuery(input);
        expect(res.handled).toBe(true);
        expect(res.confidence).toBeGreaterThanOrEqual(0.60);
      });
    });
  });

  // Category 2: Random Characters (50 cases)
  describe('Category 2: Random Characters Detections', () => {
    const randomCases = [
      'asdjklqwe', 'kjashd', 'sjdhfks', 'wueyrui', 'qwpoeiruty',
      'hfgjsdfk', 'mznxbcv', 'qpwoeiru', 'alskdjfh', 'zmxncbve',
      'vbnmksjh', 'ytrwoqui', 'bvcxzlkj', 'gfdsaqwe', 'mnbvcxyz',
      'ksjdhfgw', 'qoweiurz', 'xcnvbals', 'dkfjghsl', 'qpzmwoxn',
      'skdjfhg1', 'qpwoeir2', 'zxcvbnm3', 'lkjhgfd4', 'poiuytr5',
      'mznxbcv6', 'alskdjf7', 'qwertyu8', 'vbnmksj9', 'ytrwoqu0',
      'ksjdhfg12', 'qoweiurz34', 'xcnvbals56', 'dkfjghsl78', 'qpzmwoxn90',
      'asdjklqwea', 'kjashdksj', 'sjdhfksks', 'wueyruiwu', 'qwpoeirutyp',
      'hfgjsdfkhf', 'mznxbcvmz', 'qpwoeiruqp', 'alskdjfhal', 'zmxncbvezm'
    ];

    randomCases.forEach((input) => {
      it(`should detect random characters: "${input}"`, () => {
        const res = processQuery(input);
        expect(res.handled).toBe(true);
      });
    });
  });

  // Category 3: Mixed Noise (50 cases)
  describe('Category 3: Mixed Noise Detections', () => {
    const noiseCases = Array.from({ length: 50 }, (_, i) => `noise_${i}_!!!@@@###$$$`);
    noiseCases.forEach((input) => {
      it(`should detect mixed noise: "${input}"`, () => {
        const res = processQuery(input);
        expect(res.handled).toBe(true);
      });
    });
  });

  // Category 4: Symbol Spam (50 cases)
  describe('Category 4: Symbol Spam Detections', () => {
    const symbolCases = [
      '$$$$$$$$', '@@@@@@', '#####', '%%%%%%', '^^^^^^', '&&&&&', '********',
      '!!!!!!!!', '?????????', '~~~~~~~~', '++++++++', '========', '--------',
      '$$$$$$$$$$', '@@@@@@@@@@', '##########', '%%%%%%%%%%', '^^^^^^^^^^',
      '&&&&&&&&&&', '**********', '!!!!!!!!!!', '??????????', '~~~~~~~~~~',
      '+++++$$$$$', '@@@@@#####', '%%%%%^^^^^', '&&&&&*****', '!!!!!?????',
      '$$$$$$$$$$$$', '@@@@@@@@@@@@', '############', '%%%%%%%%%%%%',
      '^^^^^^^^^^^^', '&&&&&&&&&&&&', '************', '!!!!!!!!!!!!',
      '????????????', '~~~~~~~~~~~~', '++++++++++++', '============',
      '------------', '$$$@@@###$$$', '%%%^^^&&&***', '!!!???~~~+++',
      '===---===---', '$$$$$$$$$$$$$$$', '@@@@@@@@@@@@@@@', '###############', '%%%%%%%%%%%%%%%'
    ];

    symbolCases.forEach((input) => {
      it(`should detect symbol spam: "${input}"`, () => {
        const res = processQuery(input);
        expect(res.handled).toBe(true);
      });
    });
  });

  // Category 5: Emoji Spam (50 cases)
  describe('Category 5: Emoji Spam Detections', () => {
    const emojiCases = [
      '😂😂😂😂😂', '🤣🤣🤣🤣🤣', '😡😡😡😡', '❤️❤️❤️❤️❤️', '🔥🔥🔥🔥🔥',
      '👍👍👍👍👍👍', '🙏🙏🙏🙏🙏🙏', '🚀🚀🚀🚀🚀🚀', '🎉🎉🎉🎉🎉🎉', '💩💩💩💩💩💩',
      '😂😂😂😂😂😂😂😂', '🤣🤣🤣🤣🤣🤣🤣🤣', '😡😡😡😡😡😡😡😡', '❤️❤️❤️❤️❤️❤️❤️❤️',
      '🔥🔥🔥🔥🔥🔥🔥🔥', '👍👍👍👍👍👍👍👍', '🙏🙏🙏🙏🙏🙏🙏🙏', '🚀🚀🚀🚀🚀🚀🚀🚀',
      '🎉🎉🎉🎉🎉🎉🎉🎉', '💩💩💩💩💩💩💩💩', '😀😁😂😃😄😅😆', '😇😈😉😊😋😌😍',
      '😎😏😐😑😒😓😔', '😕😖😗😘😙😚😛', '😜😝😞😟😠😡😢', '😣😤😥😦😧😨😩',
      '😪😫😬😭😮😯😰', '😱😲😳😴😵😶😷', '😸😹😺😻😼😽😾', '😿🙀🙈🙉🙊💩🐶',
      '🐺🐱🐭🐹🐰🐸🐯', '🐨🐻🐷🐮🐗🐵🐒', '👑👒👟👞👡👠👢', '👕👔👖👗👘👙💼',
      '👜👝👛👓🕶💍💎', '⚽️🏀🏈⚾️🎾🏐🏉', '🎱🎳🏏🏑🏒🏓🏸', '🥐🍞🥖🍕🍔🍟🌭',
      '🥓🥞🧇🧀🍖🍗🥩', '🍿🧈🍱🍣🍤🍥🥮'
    ];

    emojiCases.forEach((input) => {
      it(`should detect emoji spam: "${input}"`, () => {
        const res = processQuery(input);
        expect(res.handled).toBe(true);
      });
    });
  });

  // Category 6: Repeated Characters (50 cases)
  describe('Category 6: Repeated Characters Detections', () => {
    const repeatCases = [
      'aaaaaaaaaaaa', 'hhhhhhhh', 'kkkkkkkkk', 'zzzzzzzz', 'xxxxxxxx',
      'bbbbbbbbbbbb', 'cccccccccccc', 'dddddddddddd', 'eeeeeeeeeeee', 'ffffffffffff',
      'gggggggggggg', 'iiiiiiiiiiii', 'jjjjjjjjjjjj', 'llllllllllll', 'mmmmmmmmmmmm',
      'nnnnnnnnnnnn', 'oooooooooooo', 'pppppppppppp', 'qqqqqqqqqqqq', 'rrrrrrrrrrrr',
      'ssssssssssss', 'tttttttttttt', 'uuuuuuuuuuuu', 'vvvvvvvvvvvv', 'wwwwwwwwwwww',
      'yyyyyyyyyyyy', 'aaaaaaaaaaaaa', 'hhhhhhhhhhhhh', 'kkkkkkkkkkkkk', 'zzzzzzzzzzzzz',
      'xxxxxxxxxxxxx', 'bbbbbbbbbbbbb', 'ccccccccccccc', 'ddddddddddddd', 'eeeeeeeeeeeee',
      'fffffffffffff', 'ggggggggggggg', 'iiiiiiiiiiiii', 'jjjjjjjjjjjjj', 'lllllllllllll',
      'mmmmmmmmmmmmm', 'nnnnnnnnnnnnn', 'ooooooooooooo', 'ppppppppppppp', 'qqqqqqqqqqqqq',
      'rrrrrrrrrrrrr', 'sssssssssssss', 'ttttttttttttt', 'uuuuuuuuuuuuu', 'vvvvvvvvvvvvv'
    ];

    repeatCases.forEach((input) => {
      it(`should detect repeated characters: "${input}"`, () => {
        const res = processQuery(input);
        expect(res.handled).toBe(true);
      });
    });
  });

  // Category 7: Random Numbers (50 cases)
  describe('Category 7: Random Numbers Detections', () => {
    const numberCases = Array.from({ length: 50 }, (_, i) => `${100000000 + i * 12345}`);
    numberCases.forEach((input) => {
      it(`should detect random numbers: "${input}"`, () => {
        const res = processQuery(input);
        expect(res.handled).toBe(true);
      });
    });
  });

  // Category 8: Security Injection (50 cases)
  describe('Category 8: Security Injection (SQL / HTML)', () => {
    const securityCases = [
      'SELECT *', 'DROP TABLE', 'UNION SELECT', "' OR 1=1", 'INSERT INTO', 'DELETE FROM',
      '<script>', '<iframe>', '<div>', 'onclick()', 'alert()',
      'SELECT * FROM users', 'DROP TABLE clients;', 'UNION SELECT username, password FROM users',
      "' OR 1=1 --", 'INSERT INTO accounts VALUES(1)', 'DELETE FROM logs;',
      '<script>alert(1)</script>', '<iframe src="evil.com"></iframe>', '<div onclick="alert(1)">',
      'SELECT * FROM data', 'DROP TABLE temp', 'UNION SELECT 1, 2, 3', "' OR 1=1 #",
      'INSERT INTO test VALUES(2)', 'DELETE FROM cache', '<script src="hacker.js"></script>',
      '<iframe width="100"></iframe>', '<div onmouseover="alert(1)">', 'SELECT name FROM users',
      'DROP TABLE session', 'UNION SELECT null, null', "' OR 'a'='a", 'INSERT INTO audit VALUES(3)',
      'DELETE FROM tokens', '<script>console.log(1)</script>', '<iframe height="200"></iframe>',
      '<div onload="alert(1)">', 'SELECT count(*) FROM users', 'DROP TABLE audit_logs',
      'UNION SELECT ALL 1, 2', "' OR '1'='1'", 'INSERT INTO system VALUES(4)', 'DELETE FROM keys',
      '<script type="text/javascript">', '<iframe id="frame"></iframe>', '<div style="display:none">',
      'SELECT email FROM subscribers', 'DROP TABLE metadata', 'UNION SELECT version()'
    ];

    securityCases.forEach((input) => {
      it(`should detect security injection: "${input}"`, () => {
        const res = processQuery(input);
        expect(res.handled).toBe(true);
      });
    });
  });

  // Category 9: URL Spam (50 cases)
  describe('Category 9: URL Spam Detections', () => {
    const urlCases = Array.from({ length: 50 }, (_, i) => `https://aaaaaaa${i}.com/spam/test/link`);
    urlCases.forEach((input) => {
      it(`should detect URL spam: "${input}"`, () => {
        const res = processQuery(input);
        expect(res.handled).toBe(true);
      });
    });
  });

  // Category 10: False Positive Prevention & Enterprise Terms (50 cases)
  describe('Category 10: False Positive Prevention (Enterprise & Tech Terms)', () => {
    const validTerms = [
      'Mobiloitte', 'Jagdish Harsh', 'AI', 'ML', 'LLM', 'NLP', 'IoT', 'QA', 'HR', 'CEO',
      'CTO', 'CFO', 'DevOps', 'ReactJS', 'NodeJS', 'TypeScript', 'NextJS', 'Java', 'Spring',
      'Python', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'GitHub', 'GitLab',
      'What services does Mobiloitte offer?', 'Who is the CEO of Mobiloitte?',
      'Tell me about blockchain services', 'Where is Mobiloitte office located?',
      'How to contact Mobiloitte sales team?', 'What technologies do you use?',
      'Tell me about AI consulting services', 'Do you offer mobile app development?',
      'Tell me about cloud engineering', 'What awards has Mobiloitte won?',
      'Tell me about company history', 'Do you offer internship for freshers?',
      'How to join Mobiloitte career team?', 'What is your data security standard?',
      'Can you share client case studies?', 'What software architecture do you support?',
      'Tell me about DevOps consulting', 'Do you provide React Native app development?',
      'What is Mobiloitte phone number?', 'What is Mobiloitte email address?',
      'Where is New Delhi headquarters?', 'Tell me about digital transformation',
      'Do you support microservices architecture?', 'Tell me about smart contract audit'
    ];

    validTerms.forEach((input) => {
      it(`should NOT reject legitimate query: "${input}"`, () => {
        const res = processQuery(input);
        expect(res.handled).toBe(false);
      });
    });
  });

  // Category 11: Typo Tolerance Matching (50 cases)
  describe('Category 11: Typo Tolerance Matching', () => {
    const typoCases = [
      'mobiloite', 'mobiloitte', 'javscript', 'machin learnng', 'artificail intelligence',
      'react js', 'node js', 'blockchan', 'deveops', 'mobiloite services',
      'javscript development', 'machin learnng models', 'artificail intelligence consulting',
      'react js app', 'node js backend', 'blockchan smart contracts', 'deveops deployment',
      'mobiloite company', 'javscript framework', 'machin learnng algorithm',
      'artificail intelligence solutions', 'react js developer', 'node js server',
      'blockchan security', 'deveops pipeline', 'mobiloite team', 'javscript code',
      'machin learnng prediction', 'artificail intelligence system', 'react js frontend',
      'node js API', 'blockchan ledger', 'deveops automation', 'mobiloite location',
      'javscript library', 'machin learnng training', 'artificail intelligence tech',
      'react js component', 'node js runtime', 'blockchan node', 'deveops docker',
      'mobiloite hiring', 'javscript project', 'machin learnng data',
      'artificail intelligence bot', 'react js web', 'node js microservice',
      'blockchan app', 'deveops cloud', 'mobiloite address'
    ];

    typoCases.forEach((input) => {
      it(`should NOT reject typo variation: "${input}"`, () => {
        const res = processQuery(input);
        expect(res.handled).toBe(false);
      });
    });
  });
});
