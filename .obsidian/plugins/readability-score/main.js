'use strict';

var obsidian = require('obsidian');
var state = require('@codemirror/state');
var view = require('@codemirror/view');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var removeMarkdown = function(md, options) {
  options = options || {};
  options.listUnicodeChar = options.hasOwnProperty('listUnicodeChar') ? options.listUnicodeChar : false;
  options.stripListLeaders = options.hasOwnProperty('stripListLeaders') ? options.stripListLeaders : true;
  options.gfm = options.hasOwnProperty('gfm') ? options.gfm : true;
  options.useImgAltText = options.hasOwnProperty('useImgAltText') ? options.useImgAltText : true;
  options.abbr = options.hasOwnProperty('abbr') ? options.abbr : false;
  options.replaceLinksWithURL = options.hasOwnProperty('replaceLinksWithURL') ? options.replaceLinksWithURL : false;
  options.htmlTagsToSkip = options.hasOwnProperty('htmlTagsToSkip') ? options.htmlTagsToSkip : [];

  var output = md || '';

  // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
  output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*/gm, '');

  try {
    if (options.stripListLeaders) {
      if (options.listUnicodeChar)
        output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, options.listUnicodeChar + ' $1');
      else
        output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, '$1');
    }
    if (options.gfm) {
      output = output
      // Header
        .replace(/\n={2,}/g, '\n')
        // Fenced codeblocks
        .replace(/~{3}.*\n/g, '')
        // Strikethrough
        .replace(/~~/g, '')
        // Fenced codeblocks
        .replace(/`{3}.*\n/g, '');
    }
    if (options.abbr) {
      // Remove abbreviations
      output = output.replace(/\*\[.*\]:.*\n/, '');
    }
    output = output
    // Remove HTML tags
      .replace(/<[^>]*>/g, '');

    var htmlReplaceRegex = new RegExp('<[^>]*>', 'g');
    if (options.htmlTagsToSkip.length > 0) {
      // Using negative lookahead. Eg. (?!sup|sub) will not match 'sup' and 'sub' tags.
      var joinedHtmlTagsToSkip = '(?!' + options.htmlTagsToSkip.join("|") + ')';

      // Adding the lookahead literal with the default regex for html. Eg./<(?!sup|sub)[^>]*>/ig
      htmlReplaceRegex = new RegExp(
          '<' +
          joinedHtmlTagsToSkip +
          '[^>]*>', 
          'ig'
      );
    }

    output = output
      // Remove HTML tags
      .replace(htmlReplaceRegex, '')
      // Remove setext-style headers
      .replace(/^[=\-]{2,}\s*$/g, '')
      // Remove footnotes?
      .replace(/\[\^.+?\](\: .*?$)?/g, '')
      .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
      // Remove images
      .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/g, options.useImgAltText ? '$1' : '')
      // Remove inline links
      .replace(/\[([^\]]*?)\][\[\(].*?[\]\)]/g, options.replaceLinksWithURL ? '$2' : '$1')
      // Remove blockquotes
      .replace(/^\s{0,3}>\s?/gm, '')
      // .replace(/(^|\n)\s{0,3}>\s?/g, '\n\n')
      // Remove reference-style links?
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
      // Remove atx-style headers
      .replace(/^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} #{0,}(\n)?\s{0,}$/gm, '$1$2$3')
      // Remove * emphasis
      .replace(/([\*]+)(\S)(.*?\S)??\1/g, '$2$3')
      // Remove _ emphasis. Unlike *, _ emphasis gets rendered only if 
      //   1. Either there is a whitespace character before opening _ and after closing _.
      //   2. Or _ is at the start/end of the string.
      .replace(/(^|\W)([_]+)(\S)(.*?\S)??\2($|\W)/g, '$1$3$4$5')
      // Remove code blocks
      .replace(/(`{3,})(.*?)\1/gm, '$2')
      // Remove inline code
      .replace(/`(.+?)`/g, '$1')
      // // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
      // .replace(/\n{2,}/g, '\n\n')
      // // Remove newlines in a paragraph
      // .replace(/(\S+)\n\s*(\S+)/g, '$1 $2')
      // Replace strike through
      .replace(/~(.*?)~/g, '$1');
  } catch(e) {
    console.error(e);
    return md;
  }
  return output;
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, basedir, module) {
	return module = {
		path: basedir,
		exports: {},
		require: function (path, base) {
			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
		}
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var pluralize = createCommonjsModule(function (module, exports) {
/* global define */

(function (root, pluralize) {
  /* istanbul ignore else */
  if (typeof commonjsRequire === 'function' && 'object' === 'object' && 'object' === 'object') {
    // Node.
    module.exports = pluralize();
  } else {
    // Browser global.
    root.pluralize = pluralize();
  }
})(commonjsGlobal, function () {
  // Rule storage - pluralize and singularize need to be run sequentially,
  // while other rules can be optimized using an object for instant lookups.
  var pluralRules = [];
  var singularRules = [];
  var uncountables = {};
  var irregularPlurals = {};
  var irregularSingles = {};

  /**
   * Sanitize a pluralization rule to a usable regular expression.
   *
   * @param  {(RegExp|string)} rule
   * @return {RegExp}
   */
  function sanitizeRule (rule) {
    if (typeof rule === 'string') {
      return new RegExp('^' + rule + '$', 'i');
    }

    return rule;
  }

  /**
   * Pass in a word token to produce a function that can replicate the case on
   * another word.
   *
   * @param  {string}   word
   * @param  {string}   token
   * @return {Function}
   */
  function restoreCase (word, token) {
    // Tokens are an exact match.
    if (word === token) return token;

    // Lower cased words. E.g. "hello".
    if (word === word.toLowerCase()) return token.toLowerCase();

    // Upper cased words. E.g. "WHISKY".
    if (word === word.toUpperCase()) return token.toUpperCase();

    // Title cased words. E.g. "Title".
    if (word[0] === word[0].toUpperCase()) {
      return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
    }

    // Lower cased words. E.g. "test".
    return token.toLowerCase();
  }

  /**
   * Interpolate a regexp string.
   *
   * @param  {string} str
   * @param  {Array}  args
   * @return {string}
   */
  function interpolate (str, args) {
    return str.replace(/\$(\d{1,2})/g, function (match, index) {
      return args[index] || '';
    });
  }

  /**
   * Replace a word using a rule.
   *
   * @param  {string} word
   * @param  {Array}  rule
   * @return {string}
   */
  function replace (word, rule) {
    return word.replace(rule[0], function (match, index) {
      var result = interpolate(rule[1], arguments);

      if (match === '') {
        return restoreCase(word[index - 1], result);
      }

      return restoreCase(match, result);
    });
  }

  /**
   * Sanitize a word by passing in the word and sanitization rules.
   *
   * @param  {string}   token
   * @param  {string}   word
   * @param  {Array}    rules
   * @return {string}
   */
  function sanitizeWord (token, word, rules) {
    // Empty string or doesn't need fixing.
    if (!token.length || uncountables.hasOwnProperty(token)) {
      return word;
    }

    var len = rules.length;

    // Iterate over the sanitization rules and use the first one to match.
    while (len--) {
      var rule = rules[len];

      if (rule[0].test(word)) return replace(word, rule);
    }

    return word;
  }

  /**
   * Replace a word with the updated word.
   *
   * @param  {Object}   replaceMap
   * @param  {Object}   keepMap
   * @param  {Array}    rules
   * @return {Function}
   */
  function replaceWord (replaceMap, keepMap, rules) {
    return function (word) {
      // Get the correct token and case restoration functions.
      var token = word.toLowerCase();

      // Check against the keep object map.
      if (keepMap.hasOwnProperty(token)) {
        return restoreCase(word, token);
      }

      // Check against the replacement map for a direct word replacement.
      if (replaceMap.hasOwnProperty(token)) {
        return restoreCase(word, replaceMap[token]);
      }

      // Run all the rules against the word.
      return sanitizeWord(token, word, rules);
    };
  }

  /**
   * Check if a word is part of the map.
   */
  function checkWord (replaceMap, keepMap, rules, bool) {
    return function (word) {
      var token = word.toLowerCase();

      if (keepMap.hasOwnProperty(token)) return true;
      if (replaceMap.hasOwnProperty(token)) return false;

      return sanitizeWord(token, token, rules) === token;
    };
  }

  /**
   * Pluralize or singularize a word based on the passed in count.
   *
   * @param  {string}  word      The word to pluralize
   * @param  {number}  count     How many of the word exist
   * @param  {boolean} inclusive Whether to prefix with the number (e.g. 3 ducks)
   * @return {string}
   */
  function pluralize (word, count, inclusive) {
    var pluralized = count === 1
      ? pluralize.singular(word) : pluralize.plural(word);

    return (inclusive ? count + ' ' : '') + pluralized;
  }

  /**
   * Pluralize a word.
   *
   * @type {Function}
   */
  pluralize.plural = replaceWord(
    irregularSingles, irregularPlurals, pluralRules
  );

  /**
   * Check if a word is plural.
   *
   * @type {Function}
   */
  pluralize.isPlural = checkWord(
    irregularSingles, irregularPlurals, pluralRules
  );

  /**
   * Singularize a word.
   *
   * @type {Function}
   */
  pluralize.singular = replaceWord(
    irregularPlurals, irregularSingles, singularRules
  );

  /**
   * Check if a word is singular.
   *
   * @type {Function}
   */
  pluralize.isSingular = checkWord(
    irregularPlurals, irregularSingles, singularRules
  );

  /**
   * Add a pluralization rule to the collection.
   *
   * @param {(string|RegExp)} rule
   * @param {string}          replacement
   */
  pluralize.addPluralRule = function (rule, replacement) {
    pluralRules.push([sanitizeRule(rule), replacement]);
  };

  /**
   * Add a singularization rule to the collection.
   *
   * @param {(string|RegExp)} rule
   * @param {string}          replacement
   */
  pluralize.addSingularRule = function (rule, replacement) {
    singularRules.push([sanitizeRule(rule), replacement]);
  };

  /**
   * Add an uncountable word rule.
   *
   * @param {(string|RegExp)} word
   */
  pluralize.addUncountableRule = function (word) {
    if (typeof word === 'string') {
      uncountables[word.toLowerCase()] = true;
      return;
    }

    // Set singular and plural references for the word.
    pluralize.addPluralRule(word, '$0');
    pluralize.addSingularRule(word, '$0');
  };

  /**
   * Add an irregular word definition.
   *
   * @param {string} single
   * @param {string} plural
   */
  pluralize.addIrregularRule = function (single, plural) {
    plural = plural.toLowerCase();
    single = single.toLowerCase();

    irregularSingles[single] = plural;
    irregularPlurals[plural] = single;
  };

  /**
   * Irregular rules.
   */
  [
    // Pronouns.
    ['I', 'we'],
    ['me', 'us'],
    ['he', 'they'],
    ['she', 'they'],
    ['them', 'them'],
    ['myself', 'ourselves'],
    ['yourself', 'yourselves'],
    ['itself', 'themselves'],
    ['herself', 'themselves'],
    ['himself', 'themselves'],
    ['themself', 'themselves'],
    ['is', 'are'],
    ['was', 'were'],
    ['has', 'have'],
    ['this', 'these'],
    ['that', 'those'],
    // Words ending in with a consonant and `o`.
    ['echo', 'echoes'],
    ['dingo', 'dingoes'],
    ['volcano', 'volcanoes'],
    ['tornado', 'tornadoes'],
    ['torpedo', 'torpedoes'],
    // Ends with `us`.
    ['genus', 'genera'],
    ['viscus', 'viscera'],
    // Ends with `ma`.
    ['stigma', 'stigmata'],
    ['stoma', 'stomata'],
    ['dogma', 'dogmata'],
    ['lemma', 'lemmata'],
    ['schema', 'schemata'],
    ['anathema', 'anathemata'],
    // Other irregular rules.
    ['ox', 'oxen'],
    ['axe', 'axes'],
    ['die', 'dice'],
    ['yes', 'yeses'],
    ['foot', 'feet'],
    ['eave', 'eaves'],
    ['goose', 'geese'],
    ['tooth', 'teeth'],
    ['quiz', 'quizzes'],
    ['human', 'humans'],
    ['proof', 'proofs'],
    ['carve', 'carves'],
    ['valve', 'valves'],
    ['looey', 'looies'],
    ['thief', 'thieves'],
    ['groove', 'grooves'],
    ['pickaxe', 'pickaxes'],
    ['passerby', 'passersby']
  ].forEach(function (rule) {
    return pluralize.addIrregularRule(rule[0], rule[1]);
  });

  /**
   * Pluralization rules.
   */
  [
    [/s?$/i, 's'],
    [/[^\u0000-\u007F]$/i, '$0'],
    [/([^aeiou]ese)$/i, '$1'],
    [/(ax|test)is$/i, '$1es'],
    [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es'],
    [/(e[mn]u)s?$/i, '$1s'],
    [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, '$1'],
    [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i'],
    [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'],
    [/(seraph|cherub)(?:im)?$/i, '$1im'],
    [/(her|at|gr)o$/i, '$1oes'],
    [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, '$1a'],
    [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a'],
    [/sis$/i, 'ses'],
    [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'],
    [/([^aeiouy]|qu)y$/i, '$1ies'],
    [/([^ch][ieo][ln])ey$/i, '$1ies'],
    [/(x|ch|ss|sh|zz)$/i, '$1es'],
    [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'],
    [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice'],
    [/(pe)(?:rson|ople)$/i, '$1ople'],
    [/(child)(?:ren)?$/i, '$1ren'],
    [/eaux$/i, '$0'],
    [/m[ae]n$/i, 'men'],
    ['thou', 'you']
  ].forEach(function (rule) {
    return pluralize.addPluralRule(rule[0], rule[1]);
  });

  /**
   * Singularization rules.
   */
  [
    [/s$/i, ''],
    [/(ss)$/i, '$1'],
    [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'],
    [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'],
    [/ies$/i, 'y'],
    [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, '$1ie'],
    [/\b(mon|smil)ies$/i, '$1ey'],
    [/\b((?:tit)?m|l)ice$/i, '$1ouse'],
    [/(seraph|cherub)im$/i, '$1'],
    [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, '$1'],
    [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, '$1sis'],
    [/(movie|twelve|abuse|e[mn]u)s$/i, '$1'],
    [/(test)(?:is|es)$/i, '$1is'],
    [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1us'],
    [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, '$1um'],
    [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, '$1on'],
    [/(alumn|alg|vertebr)ae$/i, '$1a'],
    [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'],
    [/(matr|append)ices$/i, '$1ix'],
    [/(pe)(rson|ople)$/i, '$1rson'],
    [/(child)ren$/i, '$1'],
    [/(eau)x?$/i, '$1'],
    [/men$/i, 'man']
  ].forEach(function (rule) {
    return pluralize.addSingularRule(rule[0], rule[1]);
  });

  /**
   * Uncountable rules.
   */
  [
    // Singular words with no plurals.
    'adulthood',
    'advice',
    'agenda',
    'aid',
    'aircraft',
    'alcohol',
    'ammo',
    'analytics',
    'anime',
    'athletics',
    'audio',
    'bison',
    'blood',
    'bream',
    'buffalo',
    'butter',
    'carp',
    'cash',
    'chassis',
    'chess',
    'clothing',
    'cod',
    'commerce',
    'cooperation',
    'corps',
    'debris',
    'diabetes',
    'digestion',
    'elk',
    'energy',
    'equipment',
    'excretion',
    'expertise',
    'firmware',
    'flounder',
    'fun',
    'gallows',
    'garbage',
    'graffiti',
    'hardware',
    'headquarters',
    'health',
    'herpes',
    'highjinks',
    'homework',
    'housework',
    'information',
    'jeans',
    'justice',
    'kudos',
    'labour',
    'literature',
    'machinery',
    'mackerel',
    'mail',
    'media',
    'mews',
    'moose',
    'music',
    'mud',
    'manga',
    'news',
    'only',
    'personnel',
    'pike',
    'plankton',
    'pliers',
    'police',
    'pollution',
    'premises',
    'rain',
    'research',
    'rice',
    'salmon',
    'scissors',
    'series',
    'sewage',
    'shambles',
    'shrimp',
    'software',
    'species',
    'staff',
    'swine',
    'tennis',
    'traffic',
    'transportation',
    'trout',
    'tuna',
    'wealth',
    'welfare',
    'whiting',
    'wildebeest',
    'wildlife',
    'you',
    /pok[eé]mon$/i,
    // Regexes.
    /[^aeiou]ese$/i, // "chinese", "japanese"
    /deer$/i, // "deer", "reindeer"
    /fish$/i, // "fish", "blowfish", "angelfish"
    /measles$/i,
    /o[iu]s$/i, // "carnivorous"
    /pox$/i, // "chickpox", "smallpox"
    /sheep$/i
  ].forEach(pluralize.addUncountableRule);

  return pluralize;
});
});

var require$$0 = {
	"105": "i",
	"192": "A",
	"193": "A",
	"194": "A",
	"195": "A",
	"196": "A",
	"197": "A",
	"199": "C",
	"200": "E",
	"201": "E",
	"202": "E",
	"203": "E",
	"204": "I",
	"205": "I",
	"206": "I",
	"207": "I",
	"209": "N",
	"210": "O",
	"211": "O",
	"212": "O",
	"213": "O",
	"214": "O",
	"216": "O",
	"217": "U",
	"218": "U",
	"219": "U",
	"220": "U",
	"221": "Y",
	"224": "a",
	"225": "a",
	"226": "a",
	"227": "a",
	"228": "a",
	"229": "a",
	"231": "c",
	"232": "e",
	"233": "e",
	"234": "e",
	"235": "e",
	"236": "i",
	"237": "i",
	"238": "i",
	"239": "i",
	"241": "n",
	"242": "o",
	"243": "o",
	"244": "o",
	"245": "o",
	"246": "o",
	"248": "o",
	"249": "u",
	"250": "u",
	"251": "u",
	"252": "u",
	"253": "y",
	"255": "y",
	"256": "A",
	"257": "a",
	"258": "A",
	"259": "a",
	"260": "A",
	"261": "a",
	"262": "C",
	"263": "c",
	"264": "C",
	"265": "c",
	"266": "C",
	"267": "c",
	"268": "C",
	"269": "c",
	"270": "D",
	"271": "d",
	"272": "D",
	"273": "d",
	"274": "E",
	"275": "e",
	"276": "E",
	"277": "e",
	"278": "E",
	"279": "e",
	"280": "E",
	"281": "e",
	"282": "E",
	"283": "e",
	"284": "G",
	"285": "g",
	"286": "G",
	"287": "g",
	"288": "G",
	"289": "g",
	"290": "G",
	"291": "g",
	"292": "H",
	"293": "h",
	"294": "H",
	"295": "h",
	"296": "I",
	"297": "i",
	"298": "I",
	"299": "i",
	"300": "I",
	"301": "i",
	"302": "I",
	"303": "i",
	"304": "I",
	"308": "J",
	"309": "j",
	"310": "K",
	"311": "k",
	"313": "L",
	"314": "l",
	"315": "L",
	"316": "l",
	"317": "L",
	"318": "l",
	"319": "L",
	"320": "l",
	"321": "L",
	"322": "l",
	"323": "N",
	"324": "n",
	"325": "N",
	"326": "n",
	"327": "N",
	"328": "n",
	"332": "O",
	"333": "o",
	"334": "O",
	"335": "o",
	"336": "O",
	"337": "o",
	"338": "O",
	"339": "o",
	"340": "R",
	"341": "r",
	"342": "R",
	"343": "r",
	"344": "R",
	"345": "r",
	"346": "S",
	"347": "s",
	"348": "S",
	"349": "s",
	"350": "S",
	"351": "s",
	"352": "S",
	"353": "s",
	"354": "T",
	"355": "t",
	"356": "T",
	"357": "t",
	"358": "T",
	"359": "t",
	"360": "U",
	"361": "u",
	"362": "U",
	"363": "u",
	"364": "U",
	"365": "u",
	"366": "U",
	"367": "u",
	"368": "U",
	"369": "u",
	"370": "U",
	"371": "u",
	"372": "W",
	"373": "w",
	"374": "Y",
	"375": "y",
	"376": "Y",
	"377": "Z",
	"378": "z",
	"379": "Z",
	"380": "z",
	"381": "Z",
	"382": "z",
	"384": "b",
	"385": "B",
	"386": "B",
	"387": "b",
	"390": "O",
	"391": "C",
	"392": "c",
	"393": "D",
	"394": "D",
	"395": "D",
	"396": "d",
	"398": "E",
	"400": "E",
	"401": "F",
	"402": "f",
	"403": "G",
	"407": "I",
	"408": "K",
	"409": "k",
	"410": "l",
	"412": "M",
	"413": "N",
	"414": "n",
	"415": "O",
	"416": "O",
	"417": "o",
	"420": "P",
	"421": "p",
	"422": "R",
	"427": "t",
	"428": "T",
	"429": "t",
	"430": "T",
	"431": "U",
	"432": "u",
	"434": "V",
	"435": "Y",
	"436": "y",
	"437": "Z",
	"438": "z",
	"461": "A",
	"462": "a",
	"463": "I",
	"464": "i",
	"465": "O",
	"466": "o",
	"467": "U",
	"468": "u",
	"477": "e",
	"484": "G",
	"485": "g",
	"486": "G",
	"487": "g",
	"488": "K",
	"489": "k",
	"490": "O",
	"491": "o",
	"500": "G",
	"501": "g",
	"504": "N",
	"505": "n",
	"512": "A",
	"513": "a",
	"514": "A",
	"515": "a",
	"516": "E",
	"517": "e",
	"518": "E",
	"519": "e",
	"520": "I",
	"521": "i",
	"522": "I",
	"523": "i",
	"524": "O",
	"525": "o",
	"526": "O",
	"527": "o",
	"528": "R",
	"529": "r",
	"530": "R",
	"531": "r",
	"532": "U",
	"533": "u",
	"534": "U",
	"535": "u",
	"536": "S",
	"537": "s",
	"538": "T",
	"539": "t",
	"542": "H",
	"543": "h",
	"544": "N",
	"545": "d",
	"548": "Z",
	"549": "z",
	"550": "A",
	"551": "a",
	"552": "E",
	"553": "e",
	"558": "O",
	"559": "o",
	"562": "Y",
	"563": "y",
	"564": "l",
	"565": "n",
	"566": "t",
	"567": "j",
	"570": "A",
	"571": "C",
	"572": "c",
	"573": "L",
	"574": "T",
	"575": "s",
	"576": "z",
	"579": "B",
	"580": "U",
	"581": "V",
	"582": "E",
	"583": "e",
	"584": "J",
	"585": "j",
	"586": "Q",
	"587": "q",
	"588": "R",
	"589": "r",
	"590": "Y",
	"591": "y",
	"592": "a",
	"593": "a",
	"595": "b",
	"596": "o",
	"597": "c",
	"598": "d",
	"599": "d",
	"600": "e",
	"603": "e",
	"604": "e",
	"605": "e",
	"606": "e",
	"607": "j",
	"608": "g",
	"609": "g",
	"610": "g",
	"613": "h",
	"614": "h",
	"616": "i",
	"618": "i",
	"619": "l",
	"620": "l",
	"621": "l",
	"623": "m",
	"624": "m",
	"625": "m",
	"626": "n",
	"627": "n",
	"628": "n",
	"629": "o",
	"633": "r",
	"634": "r",
	"635": "r",
	"636": "r",
	"637": "r",
	"638": "r",
	"639": "r",
	"640": "r",
	"641": "r",
	"642": "s",
	"647": "t",
	"648": "t",
	"649": "u",
	"651": "v",
	"652": "v",
	"653": "w",
	"654": "y",
	"655": "y",
	"656": "z",
	"657": "z",
	"663": "c",
	"665": "b",
	"666": "e",
	"667": "g",
	"668": "h",
	"669": "j",
	"670": "k",
	"671": "l",
	"672": "q",
	"686": "h",
	"688": "h",
	"690": "j",
	"691": "r",
	"692": "r",
	"694": "r",
	"695": "w",
	"696": "y",
	"737": "l",
	"738": "s",
	"739": "x",
	"780": "v",
	"829": "x",
	"851": "x",
	"867": "a",
	"868": "e",
	"869": "i",
	"870": "o",
	"871": "u",
	"872": "c",
	"873": "d",
	"874": "h",
	"875": "m",
	"876": "r",
	"877": "t",
	"878": "v",
	"879": "x",
	"7424": "a",
	"7427": "b",
	"7428": "c",
	"7429": "d",
	"7431": "e",
	"7432": "e",
	"7433": "i",
	"7434": "j",
	"7435": "k",
	"7436": "l",
	"7437": "m",
	"7438": "n",
	"7439": "o",
	"7440": "o",
	"7441": "o",
	"7442": "o",
	"7443": "o",
	"7446": "o",
	"7447": "o",
	"7448": "p",
	"7449": "r",
	"7450": "r",
	"7451": "t",
	"7452": "u",
	"7453": "u",
	"7454": "u",
	"7455": "m",
	"7456": "v",
	"7457": "w",
	"7458": "z",
	"7522": "i",
	"7523": "r",
	"7524": "u",
	"7525": "v",
	"7680": "A",
	"7681": "a",
	"7682": "B",
	"7683": "b",
	"7684": "B",
	"7685": "b",
	"7686": "B",
	"7687": "b",
	"7690": "D",
	"7691": "d",
	"7692": "D",
	"7693": "d",
	"7694": "D",
	"7695": "d",
	"7696": "D",
	"7697": "d",
	"7698": "D",
	"7699": "d",
	"7704": "E",
	"7705": "e",
	"7706": "E",
	"7707": "e",
	"7710": "F",
	"7711": "f",
	"7712": "G",
	"7713": "g",
	"7714": "H",
	"7715": "h",
	"7716": "H",
	"7717": "h",
	"7718": "H",
	"7719": "h",
	"7720": "H",
	"7721": "h",
	"7722": "H",
	"7723": "h",
	"7724": "I",
	"7725": "i",
	"7728": "K",
	"7729": "k",
	"7730": "K",
	"7731": "k",
	"7732": "K",
	"7733": "k",
	"7734": "L",
	"7735": "l",
	"7738": "L",
	"7739": "l",
	"7740": "L",
	"7741": "l",
	"7742": "M",
	"7743": "m",
	"7744": "M",
	"7745": "m",
	"7746": "M",
	"7747": "m",
	"7748": "N",
	"7749": "n",
	"7750": "N",
	"7751": "n",
	"7752": "N",
	"7753": "n",
	"7754": "N",
	"7755": "n",
	"7764": "P",
	"7765": "p",
	"7766": "P",
	"7767": "p",
	"7768": "R",
	"7769": "r",
	"7770": "R",
	"7771": "r",
	"7774": "R",
	"7775": "r",
	"7776": "S",
	"7777": "s",
	"7778": "S",
	"7779": "s",
	"7786": "T",
	"7787": "t",
	"7788": "T",
	"7789": "t",
	"7790": "T",
	"7791": "t",
	"7792": "T",
	"7793": "t",
	"7794": "U",
	"7795": "u",
	"7796": "U",
	"7797": "u",
	"7798": "U",
	"7799": "u",
	"7804": "V",
	"7805": "v",
	"7806": "V",
	"7807": "v",
	"7808": "W",
	"7809": "w",
	"7810": "W",
	"7811": "w",
	"7812": "W",
	"7813": "w",
	"7814": "W",
	"7815": "w",
	"7816": "W",
	"7817": "w",
	"7818": "X",
	"7819": "x",
	"7820": "X",
	"7821": "x",
	"7822": "Y",
	"7823": "y",
	"7824": "Z",
	"7825": "z",
	"7826": "Z",
	"7827": "z",
	"7828": "Z",
	"7829": "z",
	"7835": "s",
	"7840": "A",
	"7841": "a",
	"7842": "A",
	"7843": "a",
	"7864": "E",
	"7865": "e",
	"7866": "E",
	"7867": "e",
	"7868": "E",
	"7869": "e",
	"7880": "I",
	"7881": "i",
	"7882": "I",
	"7883": "i",
	"7884": "O",
	"7885": "o",
	"7886": "O",
	"7887": "o",
	"7908": "U",
	"7909": "u",
	"7910": "U",
	"7911": "u",
	"7922": "Y",
	"7923": "y",
	"7924": "Y",
	"7925": "y",
	"7926": "Y",
	"7927": "y",
	"7928": "Y",
	"7929": "y",
	"8305": "i",
	"8341": "h",
	"8342": "k",
	"8343": "l",
	"8344": "m",
	"8345": "n",
	"8346": "p",
	"8347": "s",
	"8348": "t",
	"8450": "c",
	"8458": "g",
	"8459": "h",
	"8460": "h",
	"8461": "h",
	"8464": "i",
	"8465": "i",
	"8466": "l",
	"8467": "l",
	"8468": "l",
	"8469": "n",
	"8472": "p",
	"8473": "p",
	"8474": "q",
	"8475": "r",
	"8476": "r",
	"8477": "r",
	"8484": "z",
	"8488": "z",
	"8492": "b",
	"8493": "c",
	"8495": "e",
	"8496": "e",
	"8497": "f",
	"8498": "F",
	"8499": "m",
	"8500": "o",
	"8506": "q",
	"8513": "g",
	"8514": "l",
	"8515": "l",
	"8516": "y",
	"8517": "d",
	"8518": "d",
	"8519": "e",
	"8520": "i",
	"8521": "j",
	"8526": "f",
	"8579": "C",
	"8580": "c",
	"8765": "s",
	"8766": "s",
	"8959": "z",
	"8999": "x",
	"9746": "x",
	"9776": "i",
	"9866": "i",
	"10005": "x",
	"10006": "x",
	"10007": "x",
	"10008": "x",
	"10625": "z",
	"10626": "z",
	"11362": "L",
	"11364": "R",
	"11365": "a",
	"11366": "t",
	"11373": "A",
	"11374": "M",
	"11375": "A",
	"11390": "S",
	"11391": "Z",
	"19904": "i",
	"42893": "H",
	"42922": "H",
	"42923": "E",
	"42924": "G",
	"42925": "L",
	"42928": "K",
	"42929": "T",
	"62937": "x"
};

var normalizeStrings = createCommonjsModule(function (module) {
(function(global, factory) {
  if (module.exports) {
    module.exports = factory(global, global.document);
  } else {
      global.normalize = factory(global, global.document);
  }
} (typeof window !== 'undefined' ? window : commonjsGlobal, function (window, document) {
  var charmap = require$$0;
  var regex = null;
  var current_charmap;
  var old_charmap;

  function normalize(str, custom_charmap) {
    old_charmap = current_charmap;
    current_charmap = custom_charmap || charmap;

    regex = (regex && old_charmap === current_charmap) ? regex : buildRegExp(current_charmap);

    return str.replace(regex, function(charToReplace) {
      return current_charmap[charToReplace.charCodeAt(0)] || charToReplace;
    });
  }

  function buildRegExp(charmap){
     return new RegExp('[' + Object.keys(charmap).map(function(code) {return String.fromCharCode(code); }).join(' ') + ']', 'g');
   }

  return normalize;
}));
});

var normalize = normalizeStrings;

/** @type {Record<string, number>} */
const problematic = {
  abalone: 4,
  abare: 3,
  abbruzzese: 4,
  abed: 2,
  aborigine: 5,
  abruzzese: 4,
  acreage: 3,
  adame: 3,
  adieu: 2,
  adobe: 3,
  anemone: 4,
  anyone: 3,
  apache: 3,
  aphrodite: 4,
  apostrophe: 4,
  ariadne: 4,
  cafe: 2,
  calliope: 4,
  catastrophe: 4,
  chile: 2,
  chloe: 2,
  circe: 2,
  coyote: 3,
  daphne: 2,
  epitome: 4,
  eurydice: 4,
  euterpe: 3,
  every: 2,
  everywhere: 3,
  forever: 3,
  gethsemane: 4,
  guacamole: 4,
  hermione: 4,
  hyperbole: 4,
  jesse: 2,
  jukebox: 2,
  karate: 3,
  machete: 3,
  maybe: 2,
  naive: 2,
  newlywed: 3,
  penelope: 4,
  people: 2,
  persephone: 4,
  phoebe: 2,
  pulse: 1,
  queue: 1,
  recipe: 3,
  riverbed: 3,
  sesame: 3,
  shoreline: 2,
  simile: 3,
  snuffleupagus: 5,
  sometimes: 2,
  syncope: 3,
  tamale: 3,
  waterbed: 3,
  wednesday: 2,
  yosemite: 4,
  zoe: 2
};

const own = {}.hasOwnProperty;

// Two expressions of occurrences which normally would be counted as two
// syllables, but should be counted as one.
const EXPRESSION_MONOSYLLABIC_ONE = new RegExp(
  [
    'awe($|d|so)',
    'cia(?:l|$)',
    'tia',
    'cius',
    'cious',
    '[^aeiou]giu',
    '[aeiouy][^aeiouy]ion',
    'iou',
    'sia$',
    'eous$',
    '[oa]gue$',
    '.[^aeiuoycgltdb]{2,}ed$',
    '.ely$',
    '^jua',
    'uai',
    'eau',
    '^busi$',
    '(?:[aeiouy](?:' +
      [
        '[bcfgklmnprsvwxyz]',
        'ch',
        'dg',
        'g[hn]',
        'lch',
        'l[lv]',
        'mm',
        'nch',
        'n[cgn]',
        'r[bcnsv]',
        'squ',
        's[chkls]',
        'th'
      ].join('|') +
      ')ed$)',
    '(?:[aeiouy](?:' +
      [
        '[bdfklmnprstvy]',
        'ch',
        'g[hn]',
        'lch',
        'l[lv]',
        'mm',
        'nch',
        'nn',
        'r[nsv]',
        'squ',
        's[cklst]',
        'th'
      ].join('|') +
      ')es$)'
  ].join('|'),
  'g'
);

const EXPRESSION_MONOSYLLABIC_TWO = new RegExp(
  '[aeiouy](?:' +
    [
      '[bcdfgklmnprstvyz]',
      'ch',
      'dg',
      'g[hn]',
      'l[lv]',
      'mm',
      'n[cgns]',
      'r[cnsv]',
      'squ',
      's[cklst]',
      'th'
    ].join('|') +
    ')e$',
  'g'
);

// Four expression of occurrences which normally would be counted as one
// syllable, but should be counted as two.
const EXPRESSION_DOUBLE_SYLLABIC_ONE = new RegExp(
  '(?:' +
    [
      '([^aeiouy])\\1l',
      '[^aeiouy]ie(?:r|s?t)',
      '[aeiouym]bl',
      'eo',
      'ism',
      'asm',
      'thm',
      'dnt',
      'snt',
      'uity',
      'dea',
      'gean',
      'oa',
      'ua',
      'react?',
      'orbed', // Cancel `'.[^aeiuoycgltdb]{2,}ed$',`
      'shred', // Cancel `'.[^aeiuoycgltdb]{2,}ed$',`
      'eings?',
      '[aeiouy]sh?e[rs]'
    ].join('|') +
    ')$',
  'g'
);

const EXPRESSION_DOUBLE_SYLLABIC_TWO = new RegExp(
  [
    'creat(?!u)',
    '[^gq]ua[^auieo]',
    '[aeiou]{3}',
    '^(?:ia|mc|coa[dglx].)',
    '^re(app|es|im|us)',
    '(th|d)eist'
  ].join('|'),
  'g'
);

const EXPRESSION_DOUBLE_SYLLABIC_THREE = new RegExp(
  [
    '[^aeiou]y[ae]',
    '[^l]lien',
    'riet',
    'dien',
    'iu',
    'io',
    'ii',
    'uen',
    '[aeilotu]real',
    'real[aeilotu]',
    'iell',
    'eo[^aeiou]',
    '[aeiou]y[aeiou]'
  ].join('|'),
  'g'
);

const EXPRESSION_DOUBLE_SYLLABIC_FOUR = /[^s]ia/;

// Expression to match single syllable pre- and suffixes.
const EXPRESSION_SINGLE = new RegExp(
  [
    '^(?:' +
      [
        'un',
        'fore',
        'ware',
        'none?',
        'out',
        'post',
        'sub',
        'pre',
        'pro',
        'dis',
        'side',
        'some'
      ].join('|') +
      ')',
    '(?:' +
      [
        'ly',
        'less',
        'some',
        'ful',
        'ers?',
        'ness',
        'cians?',
        'ments?',
        'ettes?',
        'villes?',
        'ships?',
        'sides?',
        'ports?',
        'shires?',
        '[gnst]ion(?:ed|s)?'
      ].join('|') +
      ')$'
  ].join('|'),
  'g'
);

// Expression to match double syllable pre- and suffixes.
const EXPRESSION_DOUBLE = new RegExp(
  [
    '^' +
      '(?:' +
      [
        'above',
        'anti',
        'ante',
        'counter',
        'hyper',
        'afore',
        'agri',
        'infra',
        'intra',
        'inter',
        'over',
        'semi',
        'ultra',
        'under',
        'extra',
        'dia',
        'micro',
        'mega',
        'kilo',
        'pico',
        'nano',
        'macro',
        'somer'
      ].join('|') +
      ')',
    '(?:fully|berry|woman|women|edly|union|((?:[bcdfghjklmnpqrstvwxz])|[aeiou])ye?ing)$'
  ].join('|'),
  'g'
);

// Expression to match triple syllable suffixes.
const EXPRESSION_TRIPLE = /(creations?|ology|ologist|onomy|onomist)$/g;

/**
 * Count syllables in `value`.
 *
 * @param {string} value
 *   Value to check.
 * @returns {number}
 *   Syllables in `value`.
 */
function syllable(value) {
  const values = normalize(String(value))
    .toLowerCase()
    // Remove apostrophes.
    .replace(/['’]/g, '')
    // Split on word boundaries.
    .split(/\b/g);
  let index = -1;
  let sum = 0;

  while (++index < values.length) {
    // Remove non-alphabetic characters from a given value.
    sum += one(values[index].replace(/[^a-z]/g, ''));
  }

  return sum
}

/**
 * Get syllables in a word.
 *
 * @param {string} value
 * @returns {number}
 */
function one(value) {
  let count = 0;

  if (value.length === 0) {
    return count
  }

  // Return early when possible.
  if (value.length < 3) {
    return 1
  }

  // If `value` is a hard to count, it might be in `problematic`.
  if (own.call(problematic, value)) {
    return problematic[value]
  }

  // Additionally, the singular word might be in `problematic`.
  const singular = pluralize(value, 1);

  if (own.call(problematic, singular)) {
    return problematic[singular]
  }

  const addOne = returnFactory(1);
  const subtractOne = returnFactory(-1);

  // Count some prefixes and suffixes, and remove their matched ranges.
  value = value
    .replace(EXPRESSION_TRIPLE, countFactory(3))
    .replace(EXPRESSION_DOUBLE, countFactory(2))
    .replace(EXPRESSION_SINGLE, countFactory(1));

  // Count multiple consonants.
  const parts = value.split(/[^aeiouy]+/);
  let index = -1;

  while (++index < parts.length) {
    if (parts[index] !== '') {
      count++;
    }
  }

  // Subtract one for occurrences which should be counted as one (but are
  // counted as two).
  value
    .replace(EXPRESSION_MONOSYLLABIC_ONE, subtractOne)
    .replace(EXPRESSION_MONOSYLLABIC_TWO, subtractOne);

  // Add one for occurrences which should be counted as two (but are counted as
  // one).
  value
    .replace(EXPRESSION_DOUBLE_SYLLABIC_ONE, addOne)
    .replace(EXPRESSION_DOUBLE_SYLLABIC_TWO, addOne)
    .replace(EXPRESSION_DOUBLE_SYLLABIC_THREE, addOne)
    .replace(EXPRESSION_DOUBLE_SYLLABIC_FOUR, addOne);

  // Make sure at least on is returned.
  return count || 1

  /**
   * Define scoped counters, to be used in `String#replace()` calls.
   * The scoped counter removes the matched value from the input.
   *
   * @param {number} addition
   */
  function countFactory(addition) {
    return counter
    /**
     * @returns {string}
     */
    function counter() {
      count += addition;
      return ''
    }
  }

  /**
   * This scoped counter does not remove the matched value from the input.
   *
   * @param {number} addition
   */
  function returnFactory(addition) {
    return returner
    /**
     * @param {string} $0
     * @returns {string}
     */
    function returner($0) {
      count += addition;
      return $0
    }
  }
}

/**
 * @typedef Counts
 *   Counts from input document.
 * @property {number} sentence
 *   Number of sentences.
 * @property {number} word
 *   Number of words.
 * @property {number} syllable
 *   Number of syllables.
 */

/**
 * @typedef {Counts} FleschCounts
 *   Deprecated: please use the `Counts` type instead.
 */

const sentenceWeight = 1.015;
const wordWeight = 84.6;
const base = 206.835;

/**
 * Given an object containing the number of words (`word`), the number of
 * sentences (`sentence`), and the number of syllables  (`syllable`) in a
 * document, returns the reading ease associated with the document.
 *
 * @param {Counts} counts
 *   Counts from input document.
 * @returns {number}
 *   Result is `120` (every sentence consisting of only two one-syllable words)
 *   or lower (including negative values).
 *
 *   The values have the following semantics:
 *
 *   |     Score    | Semantics                                           |
 *   | :----------: | :-------------------------------------------------- |
 *   | 90.0 – 100.0 | Easily understood by an average 11-year-old student |
 *   |  60.0 – 70.0 | Easily understood by 13- to 15-year-old students    |
 *   |  0.0 – 30.0  | Best understood by university graduates             |
 *
 *   Therefore we can use the following formula to approximate the average age
 *   a student would understand a document at, given score `score`:
 *
 *   ```js
 *   const age = 20 - Math.floor(score / 10)
 *   ```
 */
function flesch(counts) {
  if (!counts || !counts.sentence || !counts.word || !counts.syllable) {
    return Number.NaN
  }

  return (
    base -
    sentenceWeight * (counts.word / counts.sentence) -
    wordWeight * (counts.syllable / counts.word)
  )
}

function getWordCount(text) {
    const spaceDelimitedChars = /'’A-Za-z\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC/
        .source;
    const nonSpaceDelimitedWords = /\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u4E00-\u9FD5/.source;
    const nonSpaceDelimitedWordsOther = /[\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u4E00-\u9FD5]{1}/
        .source;
    const pattern = new RegExp([
        `(?:[0-9]+(?:(?:,|\\.)[0-9]+)*|[\\-${spaceDelimitedChars}])+`,
        nonSpaceDelimitedWords,
        nonSpaceDelimitedWordsOther,
    ].join("|"), "g");
    return (text.match(pattern) || []).length;
}
function getSentenceCount(text) {
    const sentences = ((text || "").match(/[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm) || []).length;
    return sentences;
}
function formatFRE(score) {
    const rounded = Math.round(score * 100) / 100;
    let output = '';
    switch (true) {
        case (90 <= rounded):
            output = rounded + ', or "very easy to read"';
            break;
        case (80 <= rounded):
            output = rounded + ', or "easy to read"';
            break;
        case (70 <= rounded):
            output = rounded + ', or "fairly easy to read"';
            break;
        case (60 <= rounded):
            output = rounded + ', or "plain English"';
            break;
        case (50 <= rounded):
            output = rounded + ', or "fairly difficult to read"';
            break;
        case (30 <= rounded):
            output = rounded + ', or "difficult to read"';
            break;
        case (10 <= rounded):
            output = rounded + ', or "very difficult to read"';
            break;
    }
    return 'r9y: ' + output;
}

class StatusBar {
    constructor(statusBarEl) {
        this.statusBarEl = statusBarEl;
        this.debounceStatusBarUpdate = obsidian.debounce((text) => this.updateStatusBar(text), 20, false);
        this.statusBarEl.classList.add("mod-clickable");
        this.statusBarEl.setAttribute("aria-label", "!!!");
        this.statusBarEl.setAttribute("aria-label-position", "top");
        this.statusBarEl.addEventListener("click", (ev) => this.onClick(ev));
    }
    onClick(ev) {
    }
    displayText(text) {
        this.statusBarEl.setText(text);
    }
    updateStatusBar(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const plainText = removeMarkdown(text, {
                stripListLeaders: true,
                listUnicodeChar: '',
                gfm: true,
                useImgAltText: true // replace images with alt-text, if present (default: true)
            });
            const syllables = syllable(plainText);
            const words = getWordCount(plainText);
            const sentences = getSentenceCount(plainText);
            const fleschCount = flesch({ sentence: sentences, word: words, syllable: syllables });
            const output = formatFRE(fleschCount);
            this.displayText(output);
        });
    }
}

class EditorPlugin {
    constructor(view) {
        this.view = view;
        this.hasPlugin = false;
    }
    update(update) {
        if (!this.hasPlugin) {
            return;
        }
        const tr = update.transactions[0];
        if (!tr) {
            return;
        }
        const userEventTypeUndefined = tr.annotation(state.Transaction.userEvent) === undefined;
        if ((tr.isUserEvent("select") || userEventTypeUndefined) &&
            tr.newSelection.ranges[0].from !== tr.newSelection.ranges[0].to) {
            let text = "";
            const selection = tr.newSelection.main;
            const textIter = tr.newDoc.iterRange(selection.from, selection.to);
            while (!textIter.done) {
                text = text + textIter.next().value;
            }
            this.plugin.statusBar.debounceStatusBarUpdate(text);
        }
        else if (tr.isUserEvent("input") ||
            tr.isUserEvent("delete") ||
            tr.isUserEvent("move") ||
            tr.isUserEvent("undo") ||
            tr.isUserEvent("redo") ||
            tr.isUserEvent("select")) {
            const textIter = tr.newDoc.iter();
            let text = "";
            while (!textIter.done) {
                text = text + textIter.next().value;
            }
            this.plugin.statusBar.debounceStatusBarUpdate(text);
        }
    }
    addPlugin(plugin) {
        this.plugin = plugin;
        this.hasPlugin = true;
    }
    destroy() { }
}
const editorPlugin = view.ViewPlugin.fromClass(EditorPlugin);

class Readability extends obsidian.Plugin {
    onunload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.statusBar = null;
        });
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            // Handle Status Bar
            let statusBarEl = this.addStatusBarItem();
            this.statusBar = new StatusBar(statusBarEl);
            // Handle the Editor Plugin
            this.registerEditorExtension(editorPlugin);
            this.app.workspace.onLayoutReady(() => {
                this.giveEditorPlugin(this.app.workspace.getMostRecentLeaf());
            });
            this.registerEvent(this.app.workspace.on("active-leaf-change", (leaf) => __awaiter(this, void 0, void 0, function* () {
                this.giveEditorPlugin(leaf);
                if (leaf.view.getViewType() !== "markdown") {
                    this.statusBar.updateStatusBar('');
                }
            })));
        });
    }
    giveEditorPlugin(leaf) {
        var _a;
        //@ts-expect-error, not typed
        const editor = (_a = leaf === null || leaf === void 0 ? void 0 : leaf.view) === null || _a === void 0 ? void 0 : _a.editor;
        if (editor) {
            const editorView = editor.cm;
            const editorPlug = editorView.plugin(editorPlugin);
            editorPlug.addPlugin(this);
            //@ts-expect-error, not typed
            const data = leaf.view.data;
            this.statusBar.updateStatusBar(data);
        }
    }
}

module.exports = Readability;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIi4uL25vZGVfbW9kdWxlcy9yZW1vdmUtbWFya2Rvd24vaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcGx1cmFsaXplL3BsdXJhbGl6ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9ub3JtYWxpemUtc3RyaW5ncy9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9zeWxsYWJsZS9wcm9ibGVtYXRpYy5qcyIsIi4uL25vZGVfbW9kdWxlcy9zeWxsYWJsZS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9mbGVzY2gvaW5kZXguanMiLCIuLi9zcmMvdXRpbHMudHMiLCIuLi9zcmMvU3RhdHVzQmFyLnRzIiwiLi4vc3JjL0VkaXRvclBsdWdpbi50cyIsIi4uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSwgU3VwcHJlc3NlZEVycm9yLCBTeW1ib2wgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXNEZWNvcmF0ZShjdG9yLCBkZXNjcmlwdG9ySW4sIGRlY29yYXRvcnMsIGNvbnRleHRJbiwgaW5pdGlhbGl6ZXJzLCBleHRyYUluaXRpYWxpemVycykge1xyXG4gICAgZnVuY3Rpb24gYWNjZXB0KGYpIHsgaWYgKGYgIT09IHZvaWQgMCAmJiB0eXBlb2YgZiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRnVuY3Rpb24gZXhwZWN0ZWRcIik7IHJldHVybiBmOyB9XHJcbiAgICB2YXIga2luZCA9IGNvbnRleHRJbi5raW5kLCBrZXkgPSBraW5kID09PSBcImdldHRlclwiID8gXCJnZXRcIiA6IGtpbmQgPT09IFwic2V0dGVyXCIgPyBcInNldFwiIDogXCJ2YWx1ZVwiO1xyXG4gICAgdmFyIHRhcmdldCA9ICFkZXNjcmlwdG9ySW4gJiYgY3RvciA/IGNvbnRleHRJbltcInN0YXRpY1wiXSA/IGN0b3IgOiBjdG9yLnByb3RvdHlwZSA6IG51bGw7XHJcbiAgICB2YXIgZGVzY3JpcHRvciA9IGRlc2NyaXB0b3JJbiB8fCAodGFyZ2V0ID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGNvbnRleHRJbi5uYW1lKSA6IHt9KTtcclxuICAgIHZhciBfLCBkb25lID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4pIGNvbnRleHRbcF0gPSBwID09PSBcImFjY2Vzc1wiID8ge30gOiBjb250ZXh0SW5bcF07XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4uYWNjZXNzKSBjb250ZXh0LmFjY2Vzc1twXSA9IGNvbnRleHRJbi5hY2Nlc3NbcF07XHJcbiAgICAgICAgY29udGV4dC5hZGRJbml0aWFsaXplciA9IGZ1bmN0aW9uIChmKSB7IGlmIChkb25lKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGFkZCBpbml0aWFsaXplcnMgYWZ0ZXIgZGVjb3JhdGlvbiBoYXMgY29tcGxldGVkXCIpOyBleHRyYUluaXRpYWxpemVycy5wdXNoKGFjY2VwdChmIHx8IG51bGwpKTsgfTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gKDAsIGRlY29yYXRvcnNbaV0pKGtpbmQgPT09IFwiYWNjZXNzb3JcIiA/IHsgZ2V0OiBkZXNjcmlwdG9yLmdldCwgc2V0OiBkZXNjcmlwdG9yLnNldCB9IDogZGVzY3JpcHRvcltrZXldLCBjb250ZXh0KTtcclxuICAgICAgICBpZiAoa2luZCA9PT0gXCJhY2Nlc3NvclwiKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHZvaWQgMCkgY29udGludWU7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwgfHwgdHlwZW9mIHJlc3VsdCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBleHBlY3RlZFwiKTtcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmdldCkpIGRlc2NyaXB0b3IuZ2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LnNldCkpIGRlc2NyaXB0b3Iuc2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmluaXQpKSBpbml0aWFsaXplcnMudW5zaGlmdChfKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoXyA9IGFjY2VwdChyZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIGlmIChraW5kID09PSBcImZpZWxkXCIpIGluaXRpYWxpemVycy51bnNoaWZ0KF8pO1xyXG4gICAgICAgICAgICBlbHNlIGRlc2NyaXB0b3Jba2V5XSA9IF87XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHRhcmdldCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgY29udGV4dEluLm5hbWUsIGRlc2NyaXB0b3IpO1xyXG4gICAgZG9uZSA9IHRydWU7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19ydW5Jbml0aWFsaXplcnModGhpc0FyZywgaW5pdGlhbGl6ZXJzLCB2YWx1ZSkge1xyXG4gICAgdmFyIHVzZVZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluaXRpYWxpemVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhbHVlID0gdXNlVmFsdWUgPyBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnLCB2YWx1ZSkgOiBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnKTtcclxuICAgIH1cclxuICAgIHJldHVybiB1c2VWYWx1ZSA/IHZhbHVlIDogdm9pZCAwO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcHJvcEtleSh4KSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHggPT09IFwic3ltYm9sXCIgPyB4IDogXCJcIi5jb25jYXQoeCk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zZXRGdW5jdGlvbk5hbWUoZiwgbmFtZSwgcHJlZml4KSB7XHJcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwic3ltYm9sXCIpIG5hbWUgPSBuYW1lLmRlc2NyaXB0aW9uID8gXCJbXCIuY29uY2F0KG5hbWUuZGVzY3JpcHRpb24sIFwiXVwiKSA6IFwiXCI7XHJcbiAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGYsIFwibmFtZVwiLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHByZWZpeCA/IFwiXCIuY29uY2F0KHByZWZpeCwgXCIgXCIsIG5hbWUpIDogbmFtZSB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoZyAmJiAoZyA9IDAsIG9wWzBdICYmIChfID0gMCkpLCBfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19jcmVhdGVCaW5kaW5nID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcclxuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XHJcbiAgICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgbykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBwKSkgX19jcmVhdGVCaW5kaW5nKG8sIG0sIHApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5KHRvLCBmcm9tLCBwYWNrKSB7XHJcbiAgICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcclxuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcclxuICAgICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IGZhbHNlIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xyXG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydFN0YXIobW9kKSB7XHJcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xyXG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEdldChyZWNlaXZlciwgc3RhdGUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIGdldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHJlYWQgcHJpdmF0ZSBtZW1iZXIgZnJvbSBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIGtpbmQgPT09IFwibVwiID8gZiA6IGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyKSA6IGYgPyBmLnZhbHVlIDogc3RhdGUuZ2V0KHJlY2VpdmVyKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRTZXQocmVjZWl2ZXIsIHN0YXRlLCB2YWx1ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwibVwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBtZXRob2QgaXMgbm90IHdyaXRhYmxlXCIpO1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgc2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3Qgd3JpdGUgcHJpdmF0ZSBtZW1iZXIgdG8gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcclxuICAgIHJldHVybiAoa2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIsIHZhbHVlKSA6IGYgPyBmLnZhbHVlID0gdmFsdWUgOiBzdGF0ZS5zZXQocmVjZWl2ZXIsIHZhbHVlKSksIHZhbHVlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEluKHN0YXRlLCByZWNlaXZlcikge1xyXG4gICAgaWYgKHJlY2VpdmVyID09PSBudWxsIHx8ICh0eXBlb2YgcmVjZWl2ZXIgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHJlY2VpdmVyICE9PSBcImZ1bmN0aW9uXCIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHVzZSAnaW4nIG9wZXJhdG9yIG9uIG5vbi1vYmplY3RcIik7XHJcbiAgICByZXR1cm4gdHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciA9PT0gc3RhdGUgOiBzdGF0ZS5oYXMocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hZGREaXNwb3NhYmxlUmVzb3VyY2UoZW52LCB2YWx1ZSwgYXN5bmMpIHtcclxuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBleHBlY3RlZC5cIik7XHJcbiAgICAgICAgdmFyIGRpc3Bvc2U7XHJcbiAgICAgICAgaWYgKGFzeW5jKSB7XHJcbiAgICAgICAgICAgIGlmICghU3ltYm9sLmFzeW5jRGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0Rpc3Bvc2UgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgICAgICAgICBkaXNwb3NlID0gdmFsdWVbU3ltYm9sLmFzeW5jRGlzcG9zZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkaXNwb3NlID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgaWYgKCFTeW1ib2wuZGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5kaXNwb3NlIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgICAgICAgICAgZGlzcG9zZSA9IHZhbHVlW1N5bWJvbC5kaXNwb3NlXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkaXNwb3NlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3Qgbm90IGRpc3Bvc2FibGUuXCIpO1xyXG4gICAgICAgIGVudi5zdGFjay5wdXNoKHsgdmFsdWU6IHZhbHVlLCBkaXNwb3NlOiBkaXNwb3NlLCBhc3luYzogYXN5bmMgfSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChhc3luYykge1xyXG4gICAgICAgIGVudi5zdGFjay5wdXNoKHsgYXN5bmM6IHRydWUgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuXHJcbnZhciBfU3VwcHJlc3NlZEVycm9yID0gdHlwZW9mIFN1cHByZXNzZWRFcnJvciA9PT0gXCJmdW5jdGlvblwiID8gU3VwcHJlc3NlZEVycm9yIDogZnVuY3Rpb24gKGVycm9yLCBzdXBwcmVzc2VkLCBtZXNzYWdlKSB7XHJcbiAgICB2YXIgZSA9IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuICAgIHJldHVybiBlLm5hbWUgPSBcIlN1cHByZXNzZWRFcnJvclwiLCBlLmVycm9yID0gZXJyb3IsIGUuc3VwcHJlc3NlZCA9IHN1cHByZXNzZWQsIGU7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kaXNwb3NlUmVzb3VyY2VzKGVudikge1xyXG4gICAgZnVuY3Rpb24gZmFpbChlKSB7XHJcbiAgICAgICAgZW52LmVycm9yID0gZW52Lmhhc0Vycm9yID8gbmV3IF9TdXBwcmVzc2VkRXJyb3IoZSwgZW52LmVycm9yLCBcIkFuIGVycm9yIHdhcyBzdXBwcmVzc2VkIGR1cmluZyBkaXNwb3NhbC5cIikgOiBlO1xyXG4gICAgICAgIGVudi5oYXNFcnJvciA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBuZXh0KCkge1xyXG4gICAgICAgIHdoaWxlIChlbnYuc3RhY2subGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHZhciByZWMgPSBlbnYuc3RhY2sucG9wKCk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gcmVjLmRpc3Bvc2UgJiYgcmVjLmRpc3Bvc2UuY2FsbChyZWMudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlYy5hc3luYykgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXN1bHQpLnRoZW4obmV4dCwgZnVuY3Rpb24oZSkgeyBmYWlsKGUpOyByZXR1cm4gbmV4dCgpOyB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgZmFpbChlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZW52Lmhhc0Vycm9yKSB0aHJvdyBlbnYuZXJyb3I7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV4dCgpO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICBfX2V4dGVuZHMsXHJcbiAgICBfX2Fzc2lnbixcclxuICAgIF9fcmVzdCxcclxuICAgIF9fZGVjb3JhdGUsXHJcbiAgICBfX3BhcmFtLFxyXG4gICAgX19tZXRhZGF0YSxcclxuICAgIF9fYXdhaXRlcixcclxuICAgIF9fZ2VuZXJhdG9yLFxyXG4gICAgX19jcmVhdGVCaW5kaW5nLFxyXG4gICAgX19leHBvcnRTdGFyLFxyXG4gICAgX192YWx1ZXMsXHJcbiAgICBfX3JlYWQsXHJcbiAgICBfX3NwcmVhZCxcclxuICAgIF9fc3ByZWFkQXJyYXlzLFxyXG4gICAgX19zcHJlYWRBcnJheSxcclxuICAgIF9fYXdhaXQsXHJcbiAgICBfX2FzeW5jR2VuZXJhdG9yLFxyXG4gICAgX19hc3luY0RlbGVnYXRvcixcclxuICAgIF9fYXN5bmNWYWx1ZXMsXHJcbiAgICBfX21ha2VUZW1wbGF0ZU9iamVjdCxcclxuICAgIF9faW1wb3J0U3RhcixcclxuICAgIF9faW1wb3J0RGVmYXVsdCxcclxuICAgIF9fY2xhc3NQcml2YXRlRmllbGRHZXQsXHJcbiAgICBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0LFxyXG4gICAgX19jbGFzc1ByaXZhdGVGaWVsZEluLFxyXG4gICAgX19hZGREaXNwb3NhYmxlUmVzb3VyY2UsXHJcbiAgICBfX2Rpc3Bvc2VSZXNvdXJjZXMsXHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obWQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIG9wdGlvbnMubGlzdFVuaWNvZGVDaGFyID0gb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnbGlzdFVuaWNvZGVDaGFyJykgPyBvcHRpb25zLmxpc3RVbmljb2RlQ2hhciA6IGZhbHNlO1xuICBvcHRpb25zLnN0cmlwTGlzdExlYWRlcnMgPSBvcHRpb25zLmhhc093blByb3BlcnR5KCdzdHJpcExpc3RMZWFkZXJzJykgPyBvcHRpb25zLnN0cmlwTGlzdExlYWRlcnMgOiB0cnVlO1xuICBvcHRpb25zLmdmbSA9IG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ2dmbScpID8gb3B0aW9ucy5nZm0gOiB0cnVlO1xuICBvcHRpb25zLnVzZUltZ0FsdFRleHQgPSBvcHRpb25zLmhhc093blByb3BlcnR5KCd1c2VJbWdBbHRUZXh0JykgPyBvcHRpb25zLnVzZUltZ0FsdFRleHQgOiB0cnVlO1xuICBvcHRpb25zLmFiYnIgPSBvcHRpb25zLmhhc093blByb3BlcnR5KCdhYmJyJykgPyBvcHRpb25zLmFiYnIgOiBmYWxzZTtcbiAgb3B0aW9ucy5yZXBsYWNlTGlua3NXaXRoVVJMID0gb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgncmVwbGFjZUxpbmtzV2l0aFVSTCcpID8gb3B0aW9ucy5yZXBsYWNlTGlua3NXaXRoVVJMIDogZmFsc2U7XG4gIG9wdGlvbnMuaHRtbFRhZ3NUb1NraXAgPSBvcHRpb25zLmhhc093blByb3BlcnR5KCdodG1sVGFnc1RvU2tpcCcpID8gb3B0aW9ucy5odG1sVGFnc1RvU2tpcCA6IFtdO1xuXG4gIHZhciBvdXRwdXQgPSBtZCB8fCAnJztcblxuICAvLyBSZW1vdmUgaG9yaXpvbnRhbCBydWxlcyAoc3RyaXBMaXN0SGVhZGVycyBjb25mbGljdCB3aXRoIHRoaXMgcnVsZSwgd2hpY2ggaXMgd2h5IGl0IGhhcyBiZWVuIG1vdmVkIHRvIHRoZSB0b3ApXG4gIG91dHB1dCA9IG91dHB1dC5yZXBsYWNlKC9eKC1cXHMqP3xcXCpcXHMqP3xfXFxzKj8pezMsfVxccyovZ20sICcnKTtcblxuICB0cnkge1xuICAgIGlmIChvcHRpb25zLnN0cmlwTGlzdExlYWRlcnMpIHtcbiAgICAgIGlmIChvcHRpb25zLmxpc3RVbmljb2RlQ2hhcilcbiAgICAgICAgb3V0cHV0ID0gb3V0cHV0LnJlcGxhY2UoL14oW1xcc1xcdF0qKShbXFwqXFwtXFwrXXxcXGQrXFwuKVxccysvZ20sIG9wdGlvbnMubGlzdFVuaWNvZGVDaGFyICsgJyAkMScpO1xuICAgICAgZWxzZVxuICAgICAgICBvdXRwdXQgPSBvdXRwdXQucmVwbGFjZSgvXihbXFxzXFx0XSopKFtcXCpcXC1cXCtdfFxcZCtcXC4pXFxzKy9nbSwgJyQxJyk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmdmbSkge1xuICAgICAgb3V0cHV0ID0gb3V0cHV0XG4gICAgICAvLyBIZWFkZXJcbiAgICAgICAgLnJlcGxhY2UoL1xcbj17Mix9L2csICdcXG4nKVxuICAgICAgICAvLyBGZW5jZWQgY29kZWJsb2Nrc1xuICAgICAgICAucmVwbGFjZSgvfnszfS4qXFxuL2csICcnKVxuICAgICAgICAvLyBTdHJpa2V0aHJvdWdoXG4gICAgICAgIC5yZXBsYWNlKC9+fi9nLCAnJylcbiAgICAgICAgLy8gRmVuY2VkIGNvZGVibG9ja3NcbiAgICAgICAgLnJlcGxhY2UoL2B7M30uKlxcbi9nLCAnJyk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmFiYnIpIHtcbiAgICAgIC8vIFJlbW92ZSBhYmJyZXZpYXRpb25zXG4gICAgICBvdXRwdXQgPSBvdXRwdXQucmVwbGFjZSgvXFwqXFxbLipcXF06LipcXG4vLCAnJyk7XG4gICAgfVxuICAgIG91dHB1dCA9IG91dHB1dFxuICAgIC8vIFJlbW92ZSBIVE1MIHRhZ3NcbiAgICAgIC5yZXBsYWNlKC88W14+XSo+L2csICcnKVxuXG4gICAgdmFyIGh0bWxSZXBsYWNlUmVnZXggPSBuZXcgUmVnRXhwKCc8W14+XSo+JywgJ2cnKTtcbiAgICBpZiAob3B0aW9ucy5odG1sVGFnc1RvU2tpcC5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBVc2luZyBuZWdhdGl2ZSBsb29rYWhlYWQuIEVnLiAoPyFzdXB8c3ViKSB3aWxsIG5vdCBtYXRjaCAnc3VwJyBhbmQgJ3N1YicgdGFncy5cbiAgICAgIHZhciBqb2luZWRIdG1sVGFnc1RvU2tpcCA9ICcoPyEnICsgb3B0aW9ucy5odG1sVGFnc1RvU2tpcC5qb2luKFwifFwiKSArICcpJztcblxuICAgICAgLy8gQWRkaW5nIHRoZSBsb29rYWhlYWQgbGl0ZXJhbCB3aXRoIHRoZSBkZWZhdWx0IHJlZ2V4IGZvciBodG1sLiBFZy4vPCg/IXN1cHxzdWIpW14+XSo+L2lnXG4gICAgICBodG1sUmVwbGFjZVJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgICAgICAgICAnPCcgK1xuICAgICAgICAgIGpvaW5lZEh0bWxUYWdzVG9Ta2lwICtcbiAgICAgICAgICAnW14+XSo+JywgXG4gICAgICAgICAgJ2lnJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBvdXRwdXQgPSBvdXRwdXRcbiAgICAgIC8vIFJlbW92ZSBIVE1MIHRhZ3NcbiAgICAgIC5yZXBsYWNlKGh0bWxSZXBsYWNlUmVnZXgsICcnKVxuICAgICAgLy8gUmVtb3ZlIHNldGV4dC1zdHlsZSBoZWFkZXJzXG4gICAgICAucmVwbGFjZSgvXls9XFwtXXsyLH1cXHMqJC9nLCAnJylcbiAgICAgIC8vIFJlbW92ZSBmb290bm90ZXM/XG4gICAgICAucmVwbGFjZSgvXFxbXFxeLis/XFxdKFxcOiAuKj8kKT8vZywgJycpXG4gICAgICAucmVwbGFjZSgvXFxzezAsMn1cXFsuKj9cXF06IC4qPyQvZywgJycpXG4gICAgICAvLyBSZW1vdmUgaW1hZ2VzXG4gICAgICAucmVwbGFjZSgvXFwhXFxbKC4qPylcXF1bXFxbXFwoXS4qP1tcXF1cXCldL2csIG9wdGlvbnMudXNlSW1nQWx0VGV4dCA/ICckMScgOiAnJylcbiAgICAgIC8vIFJlbW92ZSBpbmxpbmUgbGlua3NcbiAgICAgIC5yZXBsYWNlKC9cXFsoW15cXF1dKj8pXFxdW1xcW1xcKF0uKj9bXFxdXFwpXS9nLCBvcHRpb25zLnJlcGxhY2VMaW5rc1dpdGhVUkwgPyAnJDInIDogJyQxJylcbiAgICAgIC8vIFJlbW92ZSBibG9ja3F1b3Rlc1xuICAgICAgLnJlcGxhY2UoL15cXHN7MCwzfT5cXHM/L2dtLCAnJylcbiAgICAgIC8vIC5yZXBsYWNlKC8oXnxcXG4pXFxzezAsM30+XFxzPy9nLCAnXFxuXFxuJylcbiAgICAgIC8vIFJlbW92ZSByZWZlcmVuY2Utc3R5bGUgbGlua3M/XG4gICAgICAucmVwbGFjZSgvXlxcc3sxLDJ9XFxbKC4qPylcXF06IChcXFMrKSggXCIuKj9cIik/XFxzKiQvZywgJycpXG4gICAgICAvLyBSZW1vdmUgYXR4LXN0eWxlIGhlYWRlcnNcbiAgICAgIC5yZXBsYWNlKC9eKFxcbik/XFxzezAsfSN7MSw2fVxccyt8IHswLH0oXFxuKT9cXHN7MCx9I3swLH0gI3swLH0oXFxuKT9cXHN7MCx9JC9nbSwgJyQxJDIkMycpXG4gICAgICAvLyBSZW1vdmUgKiBlbXBoYXNpc1xuICAgICAgLnJlcGxhY2UoLyhbXFwqXSspKFxcUykoLio/XFxTKT8/XFwxL2csICckMiQzJylcbiAgICAgIC8vIFJlbW92ZSBfIGVtcGhhc2lzLiBVbmxpa2UgKiwgXyBlbXBoYXNpcyBnZXRzIHJlbmRlcmVkIG9ubHkgaWYgXG4gICAgICAvLyAgIDEuIEVpdGhlciB0aGVyZSBpcyBhIHdoaXRlc3BhY2UgY2hhcmFjdGVyIGJlZm9yZSBvcGVuaW5nIF8gYW5kIGFmdGVyIGNsb3NpbmcgXy5cbiAgICAgIC8vICAgMi4gT3IgXyBpcyBhdCB0aGUgc3RhcnQvZW5kIG9mIHRoZSBzdHJpbmcuXG4gICAgICAucmVwbGFjZSgvKF58XFxXKShbX10rKShcXFMpKC4qP1xcUyk/P1xcMigkfFxcVykvZywgJyQxJDMkNCQ1JylcbiAgICAgIC8vIFJlbW92ZSBjb2RlIGJsb2Nrc1xuICAgICAgLnJlcGxhY2UoLyhgezMsfSkoLio/KVxcMS9nbSwgJyQyJylcbiAgICAgIC8vIFJlbW92ZSBpbmxpbmUgY29kZVxuICAgICAgLnJlcGxhY2UoL2AoLis/KWAvZywgJyQxJylcbiAgICAgIC8vIC8vIFJlcGxhY2UgdHdvIG9yIG1vcmUgbmV3bGluZXMgd2l0aCBleGFjdGx5IHR3bz8gTm90IGVudGlyZWx5IHN1cmUgdGhpcyBiZWxvbmdzIGhlcmUuLi5cbiAgICAgIC8vIC5yZXBsYWNlKC9cXG57Mix9L2csICdcXG5cXG4nKVxuICAgICAgLy8gLy8gUmVtb3ZlIG5ld2xpbmVzIGluIGEgcGFyYWdyYXBoXG4gICAgICAvLyAucmVwbGFjZSgvKFxcUyspXFxuXFxzKihcXFMrKS9nLCAnJDEgJDInKVxuICAgICAgLy8gUmVwbGFjZSBzdHJpa2UgdGhyb3VnaFxuICAgICAgLnJlcGxhY2UoL34oLio/KX4vZywgJyQxJyk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgcmV0dXJuIG1kO1xuICB9XG4gIHJldHVybiBvdXRwdXQ7XG59O1xuIiwiLyogZ2xvYmFsIGRlZmluZSAqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIHBsdXJhbGl6ZSkge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAodHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gTm9kZS5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHBsdXJhbGl6ZSgpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRCwgcmVnaXN0ZXJzIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBwbHVyYWxpemUoKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbC5cbiAgICByb290LnBsdXJhbGl6ZSA9IHBsdXJhbGl6ZSgpO1xuICB9XG59KSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gIC8vIFJ1bGUgc3RvcmFnZSAtIHBsdXJhbGl6ZSBhbmQgc2luZ3VsYXJpemUgbmVlZCB0byBiZSBydW4gc2VxdWVudGlhbGx5LFxuICAvLyB3aGlsZSBvdGhlciBydWxlcyBjYW4gYmUgb3B0aW1pemVkIHVzaW5nIGFuIG9iamVjdCBmb3IgaW5zdGFudCBsb29rdXBzLlxuICB2YXIgcGx1cmFsUnVsZXMgPSBbXTtcbiAgdmFyIHNpbmd1bGFyUnVsZXMgPSBbXTtcbiAgdmFyIHVuY291bnRhYmxlcyA9IHt9O1xuICB2YXIgaXJyZWd1bGFyUGx1cmFscyA9IHt9O1xuICB2YXIgaXJyZWd1bGFyU2luZ2xlcyA9IHt9O1xuXG4gIC8qKlxuICAgKiBTYW5pdGl6ZSBhIHBsdXJhbGl6YXRpb24gcnVsZSB0byBhIHVzYWJsZSByZWd1bGFyIGV4cHJlc3Npb24uXG4gICAqXG4gICAqIEBwYXJhbSAgeyhSZWdFeHB8c3RyaW5nKX0gcnVsZVxuICAgKiBAcmV0dXJuIHtSZWdFeHB9XG4gICAqL1xuICBmdW5jdGlvbiBzYW5pdGl6ZVJ1bGUgKHJ1bGUpIHtcbiAgICBpZiAodHlwZW9mIHJ1bGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gbmV3IFJlZ0V4cCgnXicgKyBydWxlICsgJyQnLCAnaScpO1xuICAgIH1cblxuICAgIHJldHVybiBydWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhc3MgaW4gYSB3b3JkIHRva2VuIHRvIHByb2R1Y2UgYSBmdW5jdGlvbiB0aGF0IGNhbiByZXBsaWNhdGUgdGhlIGNhc2Ugb25cbiAgICogYW5vdGhlciB3b3JkLlxuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9ICAgd29yZFxuICAgKiBAcGFyYW0gIHtzdHJpbmd9ICAgdG9rZW5cbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqL1xuICBmdW5jdGlvbiByZXN0b3JlQ2FzZSAod29yZCwgdG9rZW4pIHtcbiAgICAvLyBUb2tlbnMgYXJlIGFuIGV4YWN0IG1hdGNoLlxuICAgIGlmICh3b3JkID09PSB0b2tlbikgcmV0dXJuIHRva2VuO1xuXG4gICAgLy8gTG93ZXIgY2FzZWQgd29yZHMuIEUuZy4gXCJoZWxsb1wiLlxuICAgIGlmICh3b3JkID09PSB3b3JkLnRvTG93ZXJDYXNlKCkpIHJldHVybiB0b2tlbi50b0xvd2VyQ2FzZSgpO1xuXG4gICAgLy8gVXBwZXIgY2FzZWQgd29yZHMuIEUuZy4gXCJXSElTS1lcIi5cbiAgICBpZiAod29yZCA9PT0gd29yZC50b1VwcGVyQ2FzZSgpKSByZXR1cm4gdG9rZW4udG9VcHBlckNhc2UoKTtcblxuICAgIC8vIFRpdGxlIGNhc2VkIHdvcmRzLiBFLmcuIFwiVGl0bGVcIi5cbiAgICBpZiAod29yZFswXSA9PT0gd29yZFswXS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICByZXR1cm4gdG9rZW4uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0b2tlbi5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKTtcbiAgICB9XG5cbiAgICAvLyBMb3dlciBjYXNlZCB3b3Jkcy4gRS5nLiBcInRlc3RcIi5cbiAgICByZXR1cm4gdG9rZW4udG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcnBvbGF0ZSBhIHJlZ2V4cCBzdHJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gc3RyXG4gICAqIEBwYXJhbSAge0FycmF5fSAgYXJnc1xuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBmdW5jdGlvbiBpbnRlcnBvbGF0ZSAoc3RyLCBhcmdzKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXCQoXFxkezEsMn0pL2csIGZ1bmN0aW9uIChtYXRjaCwgaW5kZXgpIHtcbiAgICAgIHJldHVybiBhcmdzW2luZGV4XSB8fCAnJztcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIGEgd29yZCB1c2luZyBhIHJ1bGUuXG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gd29yZFxuICAgKiBAcGFyYW0gIHtBcnJheX0gIHJ1bGVcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZnVuY3Rpb24gcmVwbGFjZSAod29yZCwgcnVsZSkge1xuICAgIHJldHVybiB3b3JkLnJlcGxhY2UocnVsZVswXSwgZnVuY3Rpb24gKG1hdGNoLCBpbmRleCkge1xuICAgICAgdmFyIHJlc3VsdCA9IGludGVycG9sYXRlKHJ1bGVbMV0sIGFyZ3VtZW50cyk7XG5cbiAgICAgIGlmIChtYXRjaCA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIHJlc3RvcmVDYXNlKHdvcmRbaW5kZXggLSAxXSwgcmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3RvcmVDYXNlKG1hdGNoLCByZXN1bHQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhbml0aXplIGEgd29yZCBieSBwYXNzaW5nIGluIHRoZSB3b3JkIGFuZCBzYW5pdGl6YXRpb24gcnVsZXMuXG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gICB0b2tlblxuICAgKiBAcGFyYW0gIHtzdHJpbmd9ICAgd29yZFxuICAgKiBAcGFyYW0gIHtBcnJheX0gICAgcnVsZXNcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZnVuY3Rpb24gc2FuaXRpemVXb3JkICh0b2tlbiwgd29yZCwgcnVsZXMpIHtcbiAgICAvLyBFbXB0eSBzdHJpbmcgb3IgZG9lc24ndCBuZWVkIGZpeGluZy5cbiAgICBpZiAoIXRva2VuLmxlbmd0aCB8fCB1bmNvdW50YWJsZXMuaGFzT3duUHJvcGVydHkodG9rZW4pKSB7XG4gICAgICByZXR1cm4gd29yZDtcbiAgICB9XG5cbiAgICB2YXIgbGVuID0gcnVsZXMubGVuZ3RoO1xuXG4gICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBzYW5pdGl6YXRpb24gcnVsZXMgYW5kIHVzZSB0aGUgZmlyc3Qgb25lIHRvIG1hdGNoLlxuICAgIHdoaWxlIChsZW4tLSkge1xuICAgICAgdmFyIHJ1bGUgPSBydWxlc1tsZW5dO1xuXG4gICAgICBpZiAocnVsZVswXS50ZXN0KHdvcmQpKSByZXR1cm4gcmVwbGFjZSh3b3JkLCBydWxlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd29yZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIGEgd29yZCB3aXRoIHRoZSB1cGRhdGVkIHdvcmQuXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gICByZXBsYWNlTWFwXG4gICAqIEBwYXJhbSAge09iamVjdH0gICBrZWVwTWFwXG4gICAqIEBwYXJhbSAge0FycmF5fSAgICBydWxlc1xuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICovXG4gIGZ1bmN0aW9uIHJlcGxhY2VXb3JkIChyZXBsYWNlTWFwLCBrZWVwTWFwLCBydWxlcykge1xuICAgIHJldHVybiBmdW5jdGlvbiAod29yZCkge1xuICAgICAgLy8gR2V0IHRoZSBjb3JyZWN0IHRva2VuIGFuZCBjYXNlIHJlc3RvcmF0aW9uIGZ1bmN0aW9ucy5cbiAgICAgIHZhciB0b2tlbiA9IHdvcmQudG9Mb3dlckNhc2UoKTtcblxuICAgICAgLy8gQ2hlY2sgYWdhaW5zdCB0aGUga2VlcCBvYmplY3QgbWFwLlxuICAgICAgaWYgKGtlZXBNYXAuaGFzT3duUHJvcGVydHkodG9rZW4pKSB7XG4gICAgICAgIHJldHVybiByZXN0b3JlQ2FzZSh3b3JkLCB0b2tlbik7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGFnYWluc3QgdGhlIHJlcGxhY2VtZW50IG1hcCBmb3IgYSBkaXJlY3Qgd29yZCByZXBsYWNlbWVudC5cbiAgICAgIGlmIChyZXBsYWNlTWFwLmhhc093blByb3BlcnR5KHRva2VuKSkge1xuICAgICAgICByZXR1cm4gcmVzdG9yZUNhc2Uod29yZCwgcmVwbGFjZU1hcFt0b2tlbl0pO1xuICAgICAgfVxuXG4gICAgICAvLyBSdW4gYWxsIHRoZSBydWxlcyBhZ2FpbnN0IHRoZSB3b3JkLlxuICAgICAgcmV0dXJuIHNhbml0aXplV29yZCh0b2tlbiwgd29yZCwgcnVsZXMpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYSB3b3JkIGlzIHBhcnQgb2YgdGhlIG1hcC5cbiAgICovXG4gIGZ1bmN0aW9uIGNoZWNrV29yZCAocmVwbGFjZU1hcCwga2VlcE1hcCwgcnVsZXMsIGJvb2wpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHdvcmQpIHtcbiAgICAgIHZhciB0b2tlbiA9IHdvcmQudG9Mb3dlckNhc2UoKTtcblxuICAgICAgaWYgKGtlZXBNYXAuaGFzT3duUHJvcGVydHkodG9rZW4pKSByZXR1cm4gdHJ1ZTtcbiAgICAgIGlmIChyZXBsYWNlTWFwLmhhc093blByb3BlcnR5KHRva2VuKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICByZXR1cm4gc2FuaXRpemVXb3JkKHRva2VuLCB0b2tlbiwgcnVsZXMpID09PSB0b2tlbjtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFBsdXJhbGl6ZSBvciBzaW5ndWxhcml6ZSBhIHdvcmQgYmFzZWQgb24gdGhlIHBhc3NlZCBpbiBjb3VudC5cbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfSAgd29yZCAgICAgIFRoZSB3b3JkIHRvIHBsdXJhbGl6ZVxuICAgKiBAcGFyYW0gIHtudW1iZXJ9ICBjb3VudCAgICAgSG93IG1hbnkgb2YgdGhlIHdvcmQgZXhpc3RcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gaW5jbHVzaXZlIFdoZXRoZXIgdG8gcHJlZml4IHdpdGggdGhlIG51bWJlciAoZS5nLiAzIGR1Y2tzKVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBmdW5jdGlvbiBwbHVyYWxpemUgKHdvcmQsIGNvdW50LCBpbmNsdXNpdmUpIHtcbiAgICB2YXIgcGx1cmFsaXplZCA9IGNvdW50ID09PSAxXG4gICAgICA/IHBsdXJhbGl6ZS5zaW5ndWxhcih3b3JkKSA6IHBsdXJhbGl6ZS5wbHVyYWwod29yZCk7XG5cbiAgICByZXR1cm4gKGluY2x1c2l2ZSA/IGNvdW50ICsgJyAnIDogJycpICsgcGx1cmFsaXplZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQbHVyYWxpemUgYSB3b3JkLlxuICAgKlxuICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAqL1xuICBwbHVyYWxpemUucGx1cmFsID0gcmVwbGFjZVdvcmQoXG4gICAgaXJyZWd1bGFyU2luZ2xlcywgaXJyZWd1bGFyUGx1cmFscywgcGx1cmFsUnVsZXNcbiAgKTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgYSB3b3JkIGlzIHBsdXJhbC5cbiAgICpcbiAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgKi9cbiAgcGx1cmFsaXplLmlzUGx1cmFsID0gY2hlY2tXb3JkKFxuICAgIGlycmVndWxhclNpbmdsZXMsIGlycmVndWxhclBsdXJhbHMsIHBsdXJhbFJ1bGVzXG4gICk7XG5cbiAgLyoqXG4gICAqIFNpbmd1bGFyaXplIGEgd29yZC5cbiAgICpcbiAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgKi9cbiAgcGx1cmFsaXplLnNpbmd1bGFyID0gcmVwbGFjZVdvcmQoXG4gICAgaXJyZWd1bGFyUGx1cmFscywgaXJyZWd1bGFyU2luZ2xlcywgc2luZ3VsYXJSdWxlc1xuICApO1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIHdvcmQgaXMgc2luZ3VsYXIuXG4gICAqXG4gICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICovXG4gIHBsdXJhbGl6ZS5pc1Npbmd1bGFyID0gY2hlY2tXb3JkKFxuICAgIGlycmVndWxhclBsdXJhbHMsIGlycmVndWxhclNpbmdsZXMsIHNpbmd1bGFyUnVsZXNcbiAgKTtcblxuICAvKipcbiAgICogQWRkIGEgcGx1cmFsaXphdGlvbiBydWxlIHRvIHRoZSBjb2xsZWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0geyhzdHJpbmd8UmVnRXhwKX0gcnVsZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgcmVwbGFjZW1lbnRcbiAgICovXG4gIHBsdXJhbGl6ZS5hZGRQbHVyYWxSdWxlID0gZnVuY3Rpb24gKHJ1bGUsIHJlcGxhY2VtZW50KSB7XG4gICAgcGx1cmFsUnVsZXMucHVzaChbc2FuaXRpemVSdWxlKHJ1bGUpLCByZXBsYWNlbWVudF0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGQgYSBzaW5ndWxhcml6YXRpb24gcnVsZSB0byB0aGUgY29sbGVjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHsoc3RyaW5nfFJlZ0V4cCl9IHJ1bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgIHJlcGxhY2VtZW50XG4gICAqL1xuICBwbHVyYWxpemUuYWRkU2luZ3VsYXJSdWxlID0gZnVuY3Rpb24gKHJ1bGUsIHJlcGxhY2VtZW50KSB7XG4gICAgc2luZ3VsYXJSdWxlcy5wdXNoKFtzYW5pdGl6ZVJ1bGUocnVsZSksIHJlcGxhY2VtZW50XSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCBhbiB1bmNvdW50YWJsZSB3b3JkIHJ1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7KHN0cmluZ3xSZWdFeHApfSB3b3JkXG4gICAqL1xuICBwbHVyYWxpemUuYWRkVW5jb3VudGFibGVSdWxlID0gZnVuY3Rpb24gKHdvcmQpIHtcbiAgICBpZiAodHlwZW9mIHdvcmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB1bmNvdW50YWJsZXNbd29yZC50b0xvd2VyQ2FzZSgpXSA9IHRydWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gU2V0IHNpbmd1bGFyIGFuZCBwbHVyYWwgcmVmZXJlbmNlcyBmb3IgdGhlIHdvcmQuXG4gICAgcGx1cmFsaXplLmFkZFBsdXJhbFJ1bGUod29yZCwgJyQwJyk7XG4gICAgcGx1cmFsaXplLmFkZFNpbmd1bGFyUnVsZSh3b3JkLCAnJDAnKTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIGFuIGlycmVndWxhciB3b3JkIGRlZmluaXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzaW5nbGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBsdXJhbFxuICAgKi9cbiAgcGx1cmFsaXplLmFkZElycmVndWxhclJ1bGUgPSBmdW5jdGlvbiAoc2luZ2xlLCBwbHVyYWwpIHtcbiAgICBwbHVyYWwgPSBwbHVyYWwudG9Mb3dlckNhc2UoKTtcbiAgICBzaW5nbGUgPSBzaW5nbGUudG9Mb3dlckNhc2UoKTtcblxuICAgIGlycmVndWxhclNpbmdsZXNbc2luZ2xlXSA9IHBsdXJhbDtcbiAgICBpcnJlZ3VsYXJQbHVyYWxzW3BsdXJhbF0gPSBzaW5nbGU7XG4gIH07XG5cbiAgLyoqXG4gICAqIElycmVndWxhciBydWxlcy5cbiAgICovXG4gIFtcbiAgICAvLyBQcm9ub3Vucy5cbiAgICBbJ0knLCAnd2UnXSxcbiAgICBbJ21lJywgJ3VzJ10sXG4gICAgWydoZScsICd0aGV5J10sXG4gICAgWydzaGUnLCAndGhleSddLFxuICAgIFsndGhlbScsICd0aGVtJ10sXG4gICAgWydteXNlbGYnLCAnb3Vyc2VsdmVzJ10sXG4gICAgWyd5b3Vyc2VsZicsICd5b3Vyc2VsdmVzJ10sXG4gICAgWydpdHNlbGYnLCAndGhlbXNlbHZlcyddLFxuICAgIFsnaGVyc2VsZicsICd0aGVtc2VsdmVzJ10sXG4gICAgWydoaW1zZWxmJywgJ3RoZW1zZWx2ZXMnXSxcbiAgICBbJ3RoZW1zZWxmJywgJ3RoZW1zZWx2ZXMnXSxcbiAgICBbJ2lzJywgJ2FyZSddLFxuICAgIFsnd2FzJywgJ3dlcmUnXSxcbiAgICBbJ2hhcycsICdoYXZlJ10sXG4gICAgWyd0aGlzJywgJ3RoZXNlJ10sXG4gICAgWyd0aGF0JywgJ3Rob3NlJ10sXG4gICAgLy8gV29yZHMgZW5kaW5nIGluIHdpdGggYSBjb25zb25hbnQgYW5kIGBvYC5cbiAgICBbJ2VjaG8nLCAnZWNob2VzJ10sXG4gICAgWydkaW5nbycsICdkaW5nb2VzJ10sXG4gICAgWyd2b2xjYW5vJywgJ3ZvbGNhbm9lcyddLFxuICAgIFsndG9ybmFkbycsICd0b3JuYWRvZXMnXSxcbiAgICBbJ3RvcnBlZG8nLCAndG9ycGVkb2VzJ10sXG4gICAgLy8gRW5kcyB3aXRoIGB1c2AuXG4gICAgWydnZW51cycsICdnZW5lcmEnXSxcbiAgICBbJ3Zpc2N1cycsICd2aXNjZXJhJ10sXG4gICAgLy8gRW5kcyB3aXRoIGBtYWAuXG4gICAgWydzdGlnbWEnLCAnc3RpZ21hdGEnXSxcbiAgICBbJ3N0b21hJywgJ3N0b21hdGEnXSxcbiAgICBbJ2RvZ21hJywgJ2RvZ21hdGEnXSxcbiAgICBbJ2xlbW1hJywgJ2xlbW1hdGEnXSxcbiAgICBbJ3NjaGVtYScsICdzY2hlbWF0YSddLFxuICAgIFsnYW5hdGhlbWEnLCAnYW5hdGhlbWF0YSddLFxuICAgIC8vIE90aGVyIGlycmVndWxhciBydWxlcy5cbiAgICBbJ294JywgJ294ZW4nXSxcbiAgICBbJ2F4ZScsICdheGVzJ10sXG4gICAgWydkaWUnLCAnZGljZSddLFxuICAgIFsneWVzJywgJ3llc2VzJ10sXG4gICAgWydmb290JywgJ2ZlZXQnXSxcbiAgICBbJ2VhdmUnLCAnZWF2ZXMnXSxcbiAgICBbJ2dvb3NlJywgJ2dlZXNlJ10sXG4gICAgWyd0b290aCcsICd0ZWV0aCddLFxuICAgIFsncXVpeicsICdxdWl6emVzJ10sXG4gICAgWydodW1hbicsICdodW1hbnMnXSxcbiAgICBbJ3Byb29mJywgJ3Byb29mcyddLFxuICAgIFsnY2FydmUnLCAnY2FydmVzJ10sXG4gICAgWyd2YWx2ZScsICd2YWx2ZXMnXSxcbiAgICBbJ2xvb2V5JywgJ2xvb2llcyddLFxuICAgIFsndGhpZWYnLCAndGhpZXZlcyddLFxuICAgIFsnZ3Jvb3ZlJywgJ2dyb292ZXMnXSxcbiAgICBbJ3BpY2theGUnLCAncGlja2F4ZXMnXSxcbiAgICBbJ3Bhc3NlcmJ5JywgJ3Bhc3NlcnNieSddXG4gIF0uZm9yRWFjaChmdW5jdGlvbiAocnVsZSkge1xuICAgIHJldHVybiBwbHVyYWxpemUuYWRkSXJyZWd1bGFyUnVsZShydWxlWzBdLCBydWxlWzFdKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqIFBsdXJhbGl6YXRpb24gcnVsZXMuXG4gICAqL1xuICBbXG4gICAgWy9zPyQvaSwgJ3MnXSxcbiAgICBbL1teXFx1MDAwMC1cXHUwMDdGXSQvaSwgJyQwJ10sXG4gICAgWy8oW15hZWlvdV1lc2UpJC9pLCAnJDEnXSxcbiAgICBbLyhheHx0ZXN0KWlzJC9pLCAnJDFlcyddLFxuICAgIFsvKGFsaWFzfFteYW91XXVzfHRbbG1dYXN8Z2FzfHJpcykkL2ksICckMWVzJ10sXG4gICAgWy8oZVttbl11KXM/JC9pLCAnJDFzJ10sXG4gICAgWy8oW15sXWlhc3xbYWVpb3VdbGFzfFtlanpyXWFzfFtpdV1hbSkkL2ksICckMSddLFxuICAgIFsvKGFsdW1ufHN5bGxhYnx2aXJ8cmFkaXxudWNsZXxmdW5nfGNhY3R8c3RpbXVsfHRlcm1pbnxiYWNpbGx8Zm9jfHV0ZXJ8bG9jfHN0cmF0KSg/OnVzfGkpJC9pLCAnJDFpJ10sXG4gICAgWy8oYWx1bW58YWxnfHZlcnRlYnIpKD86YXxhZSkkL2ksICckMWFlJ10sXG4gICAgWy8oc2VyYXBofGNoZXJ1YikoPzppbSk/JC9pLCAnJDFpbSddLFxuICAgIFsvKGhlcnxhdHxncilvJC9pLCAnJDFvZXMnXSxcbiAgICBbLyhhZ2VuZHxhZGRlbmR8bWlsbGVubml8ZGF0fGV4dHJlbXxiYWN0ZXJpfGRlc2lkZXJhdHxzdHJhdHxjYW5kZWxhYnJ8ZXJyYXR8b3Z8c3ltcG9zaXxjdXJyaWN1bHxhdXRvbWF0fHF1b3IpKD86YXx1bSkkL2ksICckMWEnXSxcbiAgICBbLyhhcGhlbGl8aHlwZXJiYXR8cGVyaWhlbGl8YXN5bmRldHxub3VtZW58cGhlbm9tZW58Y3JpdGVyaXxvcmdhbnxwcm9sZWdvbWVufGhlZHJ8YXV0b21hdCkoPzphfG9uKSQvaSwgJyQxYSddLFxuICAgIFsvc2lzJC9pLCAnc2VzJ10sXG4gICAgWy8oPzooa25pfHdpfGxpKWZlfChhcnxsfGVhfGVvfG9hfGhvbylmKSQvaSwgJyQxJDJ2ZXMnXSxcbiAgICBbLyhbXmFlaW91eV18cXUpeSQvaSwgJyQxaWVzJ10sXG4gICAgWy8oW15jaF1baWVvXVtsbl0pZXkkL2ksICckMWllcyddLFxuICAgIFsvKHh8Y2h8c3N8c2h8enopJC9pLCAnJDFlcyddLFxuICAgIFsvKG1hdHJ8Y29kfG11cnxzaWx8dmVydHxpbmR8YXBwZW5kKSg/Oml4fGV4KSQvaSwgJyQxaWNlcyddLFxuICAgIFsvXFxiKCg/OnRpdCk/bXxsKSg/OmljZXxvdXNlKSQvaSwgJyQxaWNlJ10sXG4gICAgWy8ocGUpKD86cnNvbnxvcGxlKSQvaSwgJyQxb3BsZSddLFxuICAgIFsvKGNoaWxkKSg/OnJlbik/JC9pLCAnJDFyZW4nXSxcbiAgICBbL2VhdXgkL2ksICckMCddLFxuICAgIFsvbVthZV1uJC9pLCAnbWVuJ10sXG4gICAgWyd0aG91JywgJ3lvdSddXG4gIF0uZm9yRWFjaChmdW5jdGlvbiAocnVsZSkge1xuICAgIHJldHVybiBwbHVyYWxpemUuYWRkUGx1cmFsUnVsZShydWxlWzBdLCBydWxlWzFdKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqIFNpbmd1bGFyaXphdGlvbiBydWxlcy5cbiAgICovXG4gIFtcbiAgICBbL3MkL2ksICcnXSxcbiAgICBbLyhzcykkL2ksICckMSddLFxuICAgIFsvKHdpfGtuaXwoPzphZnRlcnxoYWxmfGhpZ2h8bG93fG1pZHxub258bmlnaHR8W15cXHddfF4pbGkpdmVzJC9pLCAnJDFmZSddLFxuICAgIFsvKGFyfCg/OndvfFthZV0pbHxbZW9dW2FvXSl2ZXMkL2ksICckMWYnXSxcbiAgICBbL2llcyQvaSwgJ3knXSxcbiAgICBbL1xcYihbcGxdfHpvbWJ8KD86bmVja3xjcm9zcyk/dHxjb2xsfGZhZXJ8Zm9vZHxnZW58Z29vbnxncm91cHxsYXNzfHRhbGt8Z29hbHxjdXQpaWVzJC9pLCAnJDFpZSddLFxuICAgIFsvXFxiKG1vbnxzbWlsKWllcyQvaSwgJyQxZXknXSxcbiAgICBbL1xcYigoPzp0aXQpP218bClpY2UkL2ksICckMW91c2UnXSxcbiAgICBbLyhzZXJhcGh8Y2hlcnViKWltJC9pLCAnJDEnXSxcbiAgICBbLyh4fGNofHNzfHNofHp6fHR0b3xnb3xjaG98YWxpYXN8W15hb3VddXN8dFtsbV1hc3xnYXN8KD86aGVyfGF0fGdyKW98W2FlaW91XXJpcykoPzplcyk/JC9pLCAnJDEnXSxcbiAgICBbLyhhbmFseXxkaWFnbm98cGFyZW50aGV8cHJvZ25vfHN5bm9wfHRoZXxlbXBoYXxjcml8bmUpKD86c2lzfHNlcykkL2ksICckMXNpcyddLFxuICAgIFsvKG1vdmllfHR3ZWx2ZXxhYnVzZXxlW21uXXUpcyQvaSwgJyQxJ10sXG4gICAgWy8odGVzdCkoPzppc3xlcykkL2ksICckMWlzJ10sXG4gICAgWy8oYWx1bW58c3lsbGFifHZpcnxyYWRpfG51Y2xlfGZ1bmd8Y2FjdHxzdGltdWx8dGVybWlufGJhY2lsbHxmb2N8dXRlcnxsb2N8c3RyYXQpKD86dXN8aSkkL2ksICckMXVzJ10sXG4gICAgWy8oYWdlbmR8YWRkZW5kfG1pbGxlbm5pfGRhdHxleHRyZW18YmFjdGVyaXxkZXNpZGVyYXR8c3RyYXR8Y2FuZGVsYWJyfGVycmF0fG92fHN5bXBvc2l8Y3VycmljdWx8cXVvcilhJC9pLCAnJDF1bSddLFxuICAgIFsvKGFwaGVsaXxoeXBlcmJhdHxwZXJpaGVsaXxhc3luZGV0fG5vdW1lbnxwaGVub21lbnxjcml0ZXJpfG9yZ2FufHByb2xlZ29tZW58aGVkcnxhdXRvbWF0KWEkL2ksICckMW9uJ10sXG4gICAgWy8oYWx1bW58YWxnfHZlcnRlYnIpYWUkL2ksICckMWEnXSxcbiAgICBbLyhjb2R8bXVyfHNpbHx2ZXJ0fGluZClpY2VzJC9pLCAnJDFleCddLFxuICAgIFsvKG1hdHJ8YXBwZW5kKWljZXMkL2ksICckMWl4J10sXG4gICAgWy8ocGUpKHJzb258b3BsZSkkL2ksICckMXJzb24nXSxcbiAgICBbLyhjaGlsZClyZW4kL2ksICckMSddLFxuICAgIFsvKGVhdSl4PyQvaSwgJyQxJ10sXG4gICAgWy9tZW4kL2ksICdtYW4nXVxuICBdLmZvckVhY2goZnVuY3Rpb24gKHJ1bGUpIHtcbiAgICByZXR1cm4gcGx1cmFsaXplLmFkZFNpbmd1bGFyUnVsZShydWxlWzBdLCBydWxlWzFdKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqIFVuY291bnRhYmxlIHJ1bGVzLlxuICAgKi9cbiAgW1xuICAgIC8vIFNpbmd1bGFyIHdvcmRzIHdpdGggbm8gcGx1cmFscy5cbiAgICAnYWR1bHRob29kJyxcbiAgICAnYWR2aWNlJyxcbiAgICAnYWdlbmRhJyxcbiAgICAnYWlkJyxcbiAgICAnYWlyY3JhZnQnLFxuICAgICdhbGNvaG9sJyxcbiAgICAnYW1tbycsXG4gICAgJ2FuYWx5dGljcycsXG4gICAgJ2FuaW1lJyxcbiAgICAnYXRobGV0aWNzJyxcbiAgICAnYXVkaW8nLFxuICAgICdiaXNvbicsXG4gICAgJ2Jsb29kJyxcbiAgICAnYnJlYW0nLFxuICAgICdidWZmYWxvJyxcbiAgICAnYnV0dGVyJyxcbiAgICAnY2FycCcsXG4gICAgJ2Nhc2gnLFxuICAgICdjaGFzc2lzJyxcbiAgICAnY2hlc3MnLFxuICAgICdjbG90aGluZycsXG4gICAgJ2NvZCcsXG4gICAgJ2NvbW1lcmNlJyxcbiAgICAnY29vcGVyYXRpb24nLFxuICAgICdjb3JwcycsXG4gICAgJ2RlYnJpcycsXG4gICAgJ2RpYWJldGVzJyxcbiAgICAnZGlnZXN0aW9uJyxcbiAgICAnZWxrJyxcbiAgICAnZW5lcmd5JyxcbiAgICAnZXF1aXBtZW50JyxcbiAgICAnZXhjcmV0aW9uJyxcbiAgICAnZXhwZXJ0aXNlJyxcbiAgICAnZmlybXdhcmUnLFxuICAgICdmbG91bmRlcicsXG4gICAgJ2Z1bicsXG4gICAgJ2dhbGxvd3MnLFxuICAgICdnYXJiYWdlJyxcbiAgICAnZ3JhZmZpdGknLFxuICAgICdoYXJkd2FyZScsXG4gICAgJ2hlYWRxdWFydGVycycsXG4gICAgJ2hlYWx0aCcsXG4gICAgJ2hlcnBlcycsXG4gICAgJ2hpZ2hqaW5rcycsXG4gICAgJ2hvbWV3b3JrJyxcbiAgICAnaG91c2V3b3JrJyxcbiAgICAnaW5mb3JtYXRpb24nLFxuICAgICdqZWFucycsXG4gICAgJ2p1c3RpY2UnLFxuICAgICdrdWRvcycsXG4gICAgJ2xhYm91cicsXG4gICAgJ2xpdGVyYXR1cmUnLFxuICAgICdtYWNoaW5lcnknLFxuICAgICdtYWNrZXJlbCcsXG4gICAgJ21haWwnLFxuICAgICdtZWRpYScsXG4gICAgJ21ld3MnLFxuICAgICdtb29zZScsXG4gICAgJ211c2ljJyxcbiAgICAnbXVkJyxcbiAgICAnbWFuZ2EnLFxuICAgICduZXdzJyxcbiAgICAnb25seScsXG4gICAgJ3BlcnNvbm5lbCcsXG4gICAgJ3Bpa2UnLFxuICAgICdwbGFua3RvbicsXG4gICAgJ3BsaWVycycsXG4gICAgJ3BvbGljZScsXG4gICAgJ3BvbGx1dGlvbicsXG4gICAgJ3ByZW1pc2VzJyxcbiAgICAncmFpbicsXG4gICAgJ3Jlc2VhcmNoJyxcbiAgICAncmljZScsXG4gICAgJ3NhbG1vbicsXG4gICAgJ3NjaXNzb3JzJyxcbiAgICAnc2VyaWVzJyxcbiAgICAnc2V3YWdlJyxcbiAgICAnc2hhbWJsZXMnLFxuICAgICdzaHJpbXAnLFxuICAgICdzb2Z0d2FyZScsXG4gICAgJ3NwZWNpZXMnLFxuICAgICdzdGFmZicsXG4gICAgJ3N3aW5lJyxcbiAgICAndGVubmlzJyxcbiAgICAndHJhZmZpYycsXG4gICAgJ3RyYW5zcG9ydGF0aW9uJyxcbiAgICAndHJvdXQnLFxuICAgICd0dW5hJyxcbiAgICAnd2VhbHRoJyxcbiAgICAnd2VsZmFyZScsXG4gICAgJ3doaXRpbmcnLFxuICAgICd3aWxkZWJlZXN0JyxcbiAgICAnd2lsZGxpZmUnLFxuICAgICd5b3UnLFxuICAgIC9wb2tbZcOpXW1vbiQvaSxcbiAgICAvLyBSZWdleGVzLlxuICAgIC9bXmFlaW91XWVzZSQvaSwgLy8gXCJjaGluZXNlXCIsIFwiamFwYW5lc2VcIlxuICAgIC9kZWVyJC9pLCAvLyBcImRlZXJcIiwgXCJyZWluZGVlclwiXG4gICAgL2Zpc2gkL2ksIC8vIFwiZmlzaFwiLCBcImJsb3dmaXNoXCIsIFwiYW5nZWxmaXNoXCJcbiAgICAvbWVhc2xlcyQvaSxcbiAgICAvb1tpdV1zJC9pLCAvLyBcImNhcm5pdm9yb3VzXCJcbiAgICAvcG94JC9pLCAvLyBcImNoaWNrcG94XCIsIFwic21hbGxwb3hcIlxuICAgIC9zaGVlcCQvaVxuICBdLmZvckVhY2gocGx1cmFsaXplLmFkZFVuY291bnRhYmxlUnVsZSk7XG5cbiAgcmV0dXJuIHBsdXJhbGl6ZTtcbn0pO1xuIiwiKGZ1bmN0aW9uKGdsb2JhbCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoZ2xvYmFsLCBnbG9iYWwuZG9jdW1lbnQpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KGdsb2JhbCwgZ2xvYmFsLmRvY3VtZW50KTtcbiAgfSBlbHNlIHtcbiAgICAgIGdsb2JhbC5ub3JtYWxpemUgPSBmYWN0b3J5KGdsb2JhbCwgZ2xvYmFsLmRvY3VtZW50KTtcbiAgfVxufSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLCBmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCkge1xuICB2YXIgY2hhcm1hcCA9IHJlcXVpcmUoJy4vY2hhcm1hcC5qc29uJyk7XG4gIHZhciByZWdleCA9IG51bGw7XG4gIHZhciBjdXJyZW50X2NoYXJtYXA7XG4gIHZhciBvbGRfY2hhcm1hcDtcblxuICBmdW5jdGlvbiBub3JtYWxpemUoc3RyLCBjdXN0b21fY2hhcm1hcCkge1xuICAgIG9sZF9jaGFybWFwID0gY3VycmVudF9jaGFybWFwO1xuICAgIGN1cnJlbnRfY2hhcm1hcCA9IGN1c3RvbV9jaGFybWFwIHx8IGNoYXJtYXA7XG5cbiAgICByZWdleCA9IChyZWdleCAmJiBvbGRfY2hhcm1hcCA9PT0gY3VycmVudF9jaGFybWFwKSA/IHJlZ2V4IDogYnVpbGRSZWdFeHAoY3VycmVudF9jaGFybWFwKTtcblxuICAgIHJldHVybiBzdHIucmVwbGFjZShyZWdleCwgZnVuY3Rpb24oY2hhclRvUmVwbGFjZSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRfY2hhcm1hcFtjaGFyVG9SZXBsYWNlLmNoYXJDb2RlQXQoMCldIHx8IGNoYXJUb1JlcGxhY2U7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBidWlsZFJlZ0V4cChjaGFybWFwKXtcbiAgICAgcmV0dXJuIG5ldyBSZWdFeHAoJ1snICsgT2JqZWN0LmtleXMoY2hhcm1hcCkubWFwKGZ1bmN0aW9uKGNvZGUpIHtyZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKTsgfSkuam9pbignICcpICsgJ10nLCAnZycpO1xuICAgfVxuXG4gIHJldHVybiBub3JtYWxpemU7XG59KSk7XG4iLCIvKiogQHR5cGUge1JlY29yZDxzdHJpbmcsIG51bWJlcj59ICovXG5leHBvcnQgY29uc3QgcHJvYmxlbWF0aWMgPSB7XG4gIGFiYWxvbmU6IDQsXG4gIGFiYXJlOiAzLFxuICBhYmJydXp6ZXNlOiA0LFxuICBhYmVkOiAyLFxuICBhYm9yaWdpbmU6IDUsXG4gIGFicnV6emVzZTogNCxcbiAgYWNyZWFnZTogMyxcbiAgYWRhbWU6IDMsXG4gIGFkaWV1OiAyLFxuICBhZG9iZTogMyxcbiAgYW5lbW9uZTogNCxcbiAgYW55b25lOiAzLFxuICBhcGFjaGU6IDMsXG4gIGFwaHJvZGl0ZTogNCxcbiAgYXBvc3Ryb3BoZTogNCxcbiAgYXJpYWRuZTogNCxcbiAgY2FmZTogMixcbiAgY2FsbGlvcGU6IDQsXG4gIGNhdGFzdHJvcGhlOiA0LFxuICBjaGlsZTogMixcbiAgY2hsb2U6IDIsXG4gIGNpcmNlOiAyLFxuICBjb3lvdGU6IDMsXG4gIGRhcGhuZTogMixcbiAgZXBpdG9tZTogNCxcbiAgZXVyeWRpY2U6IDQsXG4gIGV1dGVycGU6IDMsXG4gIGV2ZXJ5OiAyLFxuICBldmVyeXdoZXJlOiAzLFxuICBmb3JldmVyOiAzLFxuICBnZXRoc2VtYW5lOiA0LFxuICBndWFjYW1vbGU6IDQsXG4gIGhlcm1pb25lOiA0LFxuICBoeXBlcmJvbGU6IDQsXG4gIGplc3NlOiAyLFxuICBqdWtlYm94OiAyLFxuICBrYXJhdGU6IDMsXG4gIG1hY2hldGU6IDMsXG4gIG1heWJlOiAyLFxuICBuYWl2ZTogMixcbiAgbmV3bHl3ZWQ6IDMsXG4gIHBlbmVsb3BlOiA0LFxuICBwZW9wbGU6IDIsXG4gIHBlcnNlcGhvbmU6IDQsXG4gIHBob2ViZTogMixcbiAgcHVsc2U6IDEsXG4gIHF1ZXVlOiAxLFxuICByZWNpcGU6IDMsXG4gIHJpdmVyYmVkOiAzLFxuICBzZXNhbWU6IDMsXG4gIHNob3JlbGluZTogMixcbiAgc2ltaWxlOiAzLFxuICBzbnVmZmxldXBhZ3VzOiA1LFxuICBzb21ldGltZXM6IDIsXG4gIHN5bmNvcGU6IDMsXG4gIHRhbWFsZTogMyxcbiAgd2F0ZXJiZWQ6IDMsXG4gIHdlZG5lc2RheTogMixcbiAgeW9zZW1pdGU6IDQsXG4gIHpvZTogMlxufVxuIiwiaW1wb3J0IHBsdXJhbGl6ZSBmcm9tICdwbHVyYWxpemUnXG4vLyBAdHMtaWdub3JlIHJlbW92ZSB3aGVuIHR5cGVkLlxuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICdub3JtYWxpemUtc3RyaW5ncydcbmltcG9ydCB7cHJvYmxlbWF0aWN9IGZyb20gJy4vcHJvYmxlbWF0aWMuanMnXG5cbmNvbnN0IG93biA9IHt9Lmhhc093blByb3BlcnR5XG5cbi8vIFR3byBleHByZXNzaW9ucyBvZiBvY2N1cnJlbmNlcyB3aGljaCBub3JtYWxseSB3b3VsZCBiZSBjb3VudGVkIGFzIHR3b1xuLy8gc3lsbGFibGVzLCBidXQgc2hvdWxkIGJlIGNvdW50ZWQgYXMgb25lLlxuY29uc3QgRVhQUkVTU0lPTl9NT05PU1lMTEFCSUNfT05FID0gbmV3IFJlZ0V4cChcbiAgW1xuICAgICdhd2UoJHxkfHNvKScsXG4gICAgJ2NpYSg/Omx8JCknLFxuICAgICd0aWEnLFxuICAgICdjaXVzJyxcbiAgICAnY2lvdXMnLFxuICAgICdbXmFlaW91XWdpdScsXG4gICAgJ1thZWlvdXldW15hZWlvdXldaW9uJyxcbiAgICAnaW91JyxcbiAgICAnc2lhJCcsXG4gICAgJ2VvdXMkJyxcbiAgICAnW29hXWd1ZSQnLFxuICAgICcuW15hZWl1b3ljZ2x0ZGJdezIsfWVkJCcsXG4gICAgJy5lbHkkJyxcbiAgICAnXmp1YScsXG4gICAgJ3VhaScsXG4gICAgJ2VhdScsXG4gICAgJ15idXNpJCcsXG4gICAgJyg/OlthZWlvdXldKD86JyArXG4gICAgICBbXG4gICAgICAgICdbYmNmZ2tsbW5wcnN2d3h5el0nLFxuICAgICAgICAnY2gnLFxuICAgICAgICAnZGcnLFxuICAgICAgICAnZ1tobl0nLFxuICAgICAgICAnbGNoJyxcbiAgICAgICAgJ2xbbHZdJyxcbiAgICAgICAgJ21tJyxcbiAgICAgICAgJ25jaCcsXG4gICAgICAgICduW2Nnbl0nLFxuICAgICAgICAncltiY25zdl0nLFxuICAgICAgICAnc3F1JyxcbiAgICAgICAgJ3NbY2hrbHNdJyxcbiAgICAgICAgJ3RoJ1xuICAgICAgXS5qb2luKCd8JykgK1xuICAgICAgJyllZCQpJyxcbiAgICAnKD86W2FlaW91eV0oPzonICtcbiAgICAgIFtcbiAgICAgICAgJ1tiZGZrbG1ucHJzdHZ5XScsXG4gICAgICAgICdjaCcsXG4gICAgICAgICdnW2huXScsXG4gICAgICAgICdsY2gnLFxuICAgICAgICAnbFtsdl0nLFxuICAgICAgICAnbW0nLFxuICAgICAgICAnbmNoJyxcbiAgICAgICAgJ25uJyxcbiAgICAgICAgJ3JbbnN2XScsXG4gICAgICAgICdzcXUnLFxuICAgICAgICAnc1tja2xzdF0nLFxuICAgICAgICAndGgnXG4gICAgICBdLmpvaW4oJ3wnKSArXG4gICAgICAnKWVzJCknXG4gIF0uam9pbignfCcpLFxuICAnZydcbilcblxuY29uc3QgRVhQUkVTU0lPTl9NT05PU1lMTEFCSUNfVFdPID0gbmV3IFJlZ0V4cChcbiAgJ1thZWlvdXldKD86JyArXG4gICAgW1xuICAgICAgJ1tiY2RmZ2tsbW5wcnN0dnl6XScsXG4gICAgICAnY2gnLFxuICAgICAgJ2RnJyxcbiAgICAgICdnW2huXScsXG4gICAgICAnbFtsdl0nLFxuICAgICAgJ21tJyxcbiAgICAgICduW2NnbnNdJyxcbiAgICAgICdyW2Nuc3ZdJyxcbiAgICAgICdzcXUnLFxuICAgICAgJ3NbY2tsc3RdJyxcbiAgICAgICd0aCdcbiAgICBdLmpvaW4oJ3wnKSArXG4gICAgJyllJCcsXG4gICdnJ1xuKVxuXG4vLyBGb3VyIGV4cHJlc3Npb24gb2Ygb2NjdXJyZW5jZXMgd2hpY2ggbm9ybWFsbHkgd291bGQgYmUgY291bnRlZCBhcyBvbmVcbi8vIHN5bGxhYmxlLCBidXQgc2hvdWxkIGJlIGNvdW50ZWQgYXMgdHdvLlxuY29uc3QgRVhQUkVTU0lPTl9ET1VCTEVfU1lMTEFCSUNfT05FID0gbmV3IFJlZ0V4cChcbiAgJyg/OicgK1xuICAgIFtcbiAgICAgICcoW15hZWlvdXldKVxcXFwxbCcsXG4gICAgICAnW15hZWlvdXldaWUoPzpyfHM/dCknLFxuICAgICAgJ1thZWlvdXltXWJsJyxcbiAgICAgICdlbycsXG4gICAgICAnaXNtJyxcbiAgICAgICdhc20nLFxuICAgICAgJ3RobScsXG4gICAgICAnZG50JyxcbiAgICAgICdzbnQnLFxuICAgICAgJ3VpdHknLFxuICAgICAgJ2RlYScsXG4gICAgICAnZ2VhbicsXG4gICAgICAnb2EnLFxuICAgICAgJ3VhJyxcbiAgICAgICdyZWFjdD8nLFxuICAgICAgJ29yYmVkJywgLy8gQ2FuY2VsIGAnLlteYWVpdW95Y2dsdGRiXXsyLH1lZCQnLGBcbiAgICAgICdzaHJlZCcsIC8vIENhbmNlbCBgJy5bXmFlaXVveWNnbHRkYl17Mix9ZWQkJyxgXG4gICAgICAnZWluZ3M/JyxcbiAgICAgICdbYWVpb3V5XXNoP2VbcnNdJ1xuICAgIF0uam9pbignfCcpICtcbiAgICAnKSQnLFxuICAnZydcbilcblxuY29uc3QgRVhQUkVTU0lPTl9ET1VCTEVfU1lMTEFCSUNfVFdPID0gbmV3IFJlZ0V4cChcbiAgW1xuICAgICdjcmVhdCg/IXUpJyxcbiAgICAnW15ncV11YVteYXVpZW9dJyxcbiAgICAnW2FlaW91XXszfScsXG4gICAgJ14oPzppYXxtY3xjb2FbZGdseF0uKScsXG4gICAgJ15yZShhcHB8ZXN8aW18dXMpJyxcbiAgICAnKHRofGQpZWlzdCdcbiAgXS5qb2luKCd8JyksXG4gICdnJ1xuKVxuXG5jb25zdCBFWFBSRVNTSU9OX0RPVUJMRV9TWUxMQUJJQ19USFJFRSA9IG5ldyBSZWdFeHAoXG4gIFtcbiAgICAnW15hZWlvdV15W2FlXScsXG4gICAgJ1tebF1saWVuJyxcbiAgICAncmlldCcsXG4gICAgJ2RpZW4nLFxuICAgICdpdScsXG4gICAgJ2lvJyxcbiAgICAnaWknLFxuICAgICd1ZW4nLFxuICAgICdbYWVpbG90dV1yZWFsJyxcbiAgICAncmVhbFthZWlsb3R1XScsXG4gICAgJ2llbGwnLFxuICAgICdlb1teYWVpb3VdJyxcbiAgICAnW2FlaW91XXlbYWVpb3VdJ1xuICBdLmpvaW4oJ3wnKSxcbiAgJ2cnXG4pXG5cbmNvbnN0IEVYUFJFU1NJT05fRE9VQkxFX1NZTExBQklDX0ZPVVIgPSAvW15zXWlhL1xuXG4vLyBFeHByZXNzaW9uIHRvIG1hdGNoIHNpbmdsZSBzeWxsYWJsZSBwcmUtIGFuZCBzdWZmaXhlcy5cbmNvbnN0IEVYUFJFU1NJT05fU0lOR0xFID0gbmV3IFJlZ0V4cChcbiAgW1xuICAgICdeKD86JyArXG4gICAgICBbXG4gICAgICAgICd1bicsXG4gICAgICAgICdmb3JlJyxcbiAgICAgICAgJ3dhcmUnLFxuICAgICAgICAnbm9uZT8nLFxuICAgICAgICAnb3V0JyxcbiAgICAgICAgJ3Bvc3QnLFxuICAgICAgICAnc3ViJyxcbiAgICAgICAgJ3ByZScsXG4gICAgICAgICdwcm8nLFxuICAgICAgICAnZGlzJyxcbiAgICAgICAgJ3NpZGUnLFxuICAgICAgICAnc29tZSdcbiAgICAgIF0uam9pbignfCcpICtcbiAgICAgICcpJyxcbiAgICAnKD86JyArXG4gICAgICBbXG4gICAgICAgICdseScsXG4gICAgICAgICdsZXNzJyxcbiAgICAgICAgJ3NvbWUnLFxuICAgICAgICAnZnVsJyxcbiAgICAgICAgJ2Vycz8nLFxuICAgICAgICAnbmVzcycsXG4gICAgICAgICdjaWFucz8nLFxuICAgICAgICAnbWVudHM/JyxcbiAgICAgICAgJ2V0dGVzPycsXG4gICAgICAgICd2aWxsZXM/JyxcbiAgICAgICAgJ3NoaXBzPycsXG4gICAgICAgICdzaWRlcz8nLFxuICAgICAgICAncG9ydHM/JyxcbiAgICAgICAgJ3NoaXJlcz8nLFxuICAgICAgICAnW2duc3RdaW9uKD86ZWR8cyk/J1xuICAgICAgXS5qb2luKCd8JykgK1xuICAgICAgJykkJ1xuICBdLmpvaW4oJ3wnKSxcbiAgJ2cnXG4pXG5cbi8vIEV4cHJlc3Npb24gdG8gbWF0Y2ggZG91YmxlIHN5bGxhYmxlIHByZS0gYW5kIHN1ZmZpeGVzLlxuY29uc3QgRVhQUkVTU0lPTl9ET1VCTEUgPSBuZXcgUmVnRXhwKFxuICBbXG4gICAgJ14nICtcbiAgICAgICcoPzonICtcbiAgICAgIFtcbiAgICAgICAgJ2Fib3ZlJyxcbiAgICAgICAgJ2FudGknLFxuICAgICAgICAnYW50ZScsXG4gICAgICAgICdjb3VudGVyJyxcbiAgICAgICAgJ2h5cGVyJyxcbiAgICAgICAgJ2Fmb3JlJyxcbiAgICAgICAgJ2FncmknLFxuICAgICAgICAnaW5mcmEnLFxuICAgICAgICAnaW50cmEnLFxuICAgICAgICAnaW50ZXInLFxuICAgICAgICAnb3ZlcicsXG4gICAgICAgICdzZW1pJyxcbiAgICAgICAgJ3VsdHJhJyxcbiAgICAgICAgJ3VuZGVyJyxcbiAgICAgICAgJ2V4dHJhJyxcbiAgICAgICAgJ2RpYScsXG4gICAgICAgICdtaWNybycsXG4gICAgICAgICdtZWdhJyxcbiAgICAgICAgJ2tpbG8nLFxuICAgICAgICAncGljbycsXG4gICAgICAgICduYW5vJyxcbiAgICAgICAgJ21hY3JvJyxcbiAgICAgICAgJ3NvbWVyJ1xuICAgICAgXS5qb2luKCd8JykgK1xuICAgICAgJyknLFxuICAgICcoPzpmdWxseXxiZXJyeXx3b21hbnx3b21lbnxlZGx5fHVuaW9ufCgoPzpbYmNkZmdoamtsbW5wcXJzdHZ3eHpdKXxbYWVpb3VdKXllP2luZykkJ1xuICBdLmpvaW4oJ3wnKSxcbiAgJ2cnXG4pXG5cbi8vIEV4cHJlc3Npb24gdG8gbWF0Y2ggdHJpcGxlIHN5bGxhYmxlIHN1ZmZpeGVzLlxuY29uc3QgRVhQUkVTU0lPTl9UUklQTEUgPSAvKGNyZWF0aW9ucz98b2xvZ3l8b2xvZ2lzdHxvbm9teXxvbm9taXN0KSQvZ1xuXG4vKipcbiAqIENvdW50IHN5bGxhYmxlcyBpbiBgdmFsdWVgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICogICBWYWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKiAgIFN5bGxhYmxlcyBpbiBgdmFsdWVgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3lsbGFibGUodmFsdWUpIHtcbiAgY29uc3QgdmFsdWVzID0gbm9ybWFsaXplKFN0cmluZyh2YWx1ZSkpXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAvLyBSZW1vdmUgYXBvc3Ryb3BoZXMuXG4gICAgLnJlcGxhY2UoL1sn4oCZXS9nLCAnJylcbiAgICAvLyBTcGxpdCBvbiB3b3JkIGJvdW5kYXJpZXMuXG4gICAgLnNwbGl0KC9cXGIvZylcbiAgbGV0IGluZGV4ID0gLTFcbiAgbGV0IHN1bSA9IDBcblxuICB3aGlsZSAoKytpbmRleCA8IHZhbHVlcy5sZW5ndGgpIHtcbiAgICAvLyBSZW1vdmUgbm9uLWFscGhhYmV0aWMgY2hhcmFjdGVycyBmcm9tIGEgZ2l2ZW4gdmFsdWUuXG4gICAgc3VtICs9IG9uZSh2YWx1ZXNbaW5kZXhdLnJlcGxhY2UoL1teYS16XS9nLCAnJykpXG4gIH1cblxuICByZXR1cm4gc3VtXG59XG5cbi8qKlxuICogR2V0IHN5bGxhYmxlcyBpbiBhIHdvcmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBvbmUodmFsdWUpIHtcbiAgbGV0IGNvdW50ID0gMFxuXG4gIGlmICh2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gY291bnRcbiAgfVxuXG4gIC8vIFJldHVybiBlYXJseSB3aGVuIHBvc3NpYmxlLlxuICBpZiAodmFsdWUubGVuZ3RoIDwgMykge1xuICAgIHJldHVybiAxXG4gIH1cblxuICAvLyBJZiBgdmFsdWVgIGlzIGEgaGFyZCB0byBjb3VudCwgaXQgbWlnaHQgYmUgaW4gYHByb2JsZW1hdGljYC5cbiAgaWYgKG93bi5jYWxsKHByb2JsZW1hdGljLCB2YWx1ZSkpIHtcbiAgICByZXR1cm4gcHJvYmxlbWF0aWNbdmFsdWVdXG4gIH1cblxuICAvLyBBZGRpdGlvbmFsbHksIHRoZSBzaW5ndWxhciB3b3JkIG1pZ2h0IGJlIGluIGBwcm9ibGVtYXRpY2AuXG4gIGNvbnN0IHNpbmd1bGFyID0gcGx1cmFsaXplKHZhbHVlLCAxKVxuXG4gIGlmIChvd24uY2FsbChwcm9ibGVtYXRpYywgc2luZ3VsYXIpKSB7XG4gICAgcmV0dXJuIHByb2JsZW1hdGljW3Npbmd1bGFyXVxuICB9XG5cbiAgY29uc3QgYWRkT25lID0gcmV0dXJuRmFjdG9yeSgxKVxuICBjb25zdCBzdWJ0cmFjdE9uZSA9IHJldHVybkZhY3RvcnkoLTEpXG5cbiAgLy8gQ291bnQgc29tZSBwcmVmaXhlcyBhbmQgc3VmZml4ZXMsIGFuZCByZW1vdmUgdGhlaXIgbWF0Y2hlZCByYW5nZXMuXG4gIHZhbHVlID0gdmFsdWVcbiAgICAucmVwbGFjZShFWFBSRVNTSU9OX1RSSVBMRSwgY291bnRGYWN0b3J5KDMpKVxuICAgIC5yZXBsYWNlKEVYUFJFU1NJT05fRE9VQkxFLCBjb3VudEZhY3RvcnkoMikpXG4gICAgLnJlcGxhY2UoRVhQUkVTU0lPTl9TSU5HTEUsIGNvdW50RmFjdG9yeSgxKSlcblxuICAvLyBDb3VudCBtdWx0aXBsZSBjb25zb25hbnRzLlxuICBjb25zdCBwYXJ0cyA9IHZhbHVlLnNwbGl0KC9bXmFlaW91eV0rLylcbiAgbGV0IGluZGV4ID0gLTFcblxuICB3aGlsZSAoKytpbmRleCA8IHBhcnRzLmxlbmd0aCkge1xuICAgIGlmIChwYXJ0c1tpbmRleF0gIT09ICcnKSB7XG4gICAgICBjb3VudCsrXG4gICAgfVxuICB9XG5cbiAgLy8gU3VidHJhY3Qgb25lIGZvciBvY2N1cnJlbmNlcyB3aGljaCBzaG91bGQgYmUgY291bnRlZCBhcyBvbmUgKGJ1dCBhcmVcbiAgLy8gY291bnRlZCBhcyB0d28pLlxuICB2YWx1ZVxuICAgIC5yZXBsYWNlKEVYUFJFU1NJT05fTU9OT1NZTExBQklDX09ORSwgc3VidHJhY3RPbmUpXG4gICAgLnJlcGxhY2UoRVhQUkVTU0lPTl9NT05PU1lMTEFCSUNfVFdPLCBzdWJ0cmFjdE9uZSlcblxuICAvLyBBZGQgb25lIGZvciBvY2N1cnJlbmNlcyB3aGljaCBzaG91bGQgYmUgY291bnRlZCBhcyB0d28gKGJ1dCBhcmUgY291bnRlZCBhc1xuICAvLyBvbmUpLlxuICB2YWx1ZVxuICAgIC5yZXBsYWNlKEVYUFJFU1NJT05fRE9VQkxFX1NZTExBQklDX09ORSwgYWRkT25lKVxuICAgIC5yZXBsYWNlKEVYUFJFU1NJT05fRE9VQkxFX1NZTExBQklDX1RXTywgYWRkT25lKVxuICAgIC5yZXBsYWNlKEVYUFJFU1NJT05fRE9VQkxFX1NZTExBQklDX1RIUkVFLCBhZGRPbmUpXG4gICAgLnJlcGxhY2UoRVhQUkVTU0lPTl9ET1VCTEVfU1lMTEFCSUNfRk9VUiwgYWRkT25lKVxuXG4gIC8vIE1ha2Ugc3VyZSBhdCBsZWFzdCBvbiBpcyByZXR1cm5lZC5cbiAgcmV0dXJuIGNvdW50IHx8IDFcblxuICAvKipcbiAgICogRGVmaW5lIHNjb3BlZCBjb3VudGVycywgdG8gYmUgdXNlZCBpbiBgU3RyaW5nI3JlcGxhY2UoKWAgY2FsbHMuXG4gICAqIFRoZSBzY29wZWQgY291bnRlciByZW1vdmVzIHRoZSBtYXRjaGVkIHZhbHVlIGZyb20gdGhlIGlucHV0LlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gYWRkaXRpb25cbiAgICovXG4gIGZ1bmN0aW9uIGNvdW50RmFjdG9yeShhZGRpdGlvbikge1xuICAgIHJldHVybiBjb3VudGVyXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjb3VudGVyKCkge1xuICAgICAgY291bnQgKz0gYWRkaXRpb25cbiAgICAgIHJldHVybiAnJ1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIHNjb3BlZCBjb3VudGVyIGRvZXMgbm90IHJlbW92ZSB0aGUgbWF0Y2hlZCB2YWx1ZSBmcm9tIHRoZSBpbnB1dC5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFkZGl0aW9uXG4gICAqL1xuICBmdW5jdGlvbiByZXR1cm5GYWN0b3J5KGFkZGl0aW9uKSB7XG4gICAgcmV0dXJuIHJldHVybmVyXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9ICQwXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXR1cm5lcigkMCkge1xuICAgICAgY291bnQgKz0gYWRkaXRpb25cbiAgICAgIHJldHVybiAkMFxuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBAdHlwZWRlZiBDb3VudHNcbiAqICAgQ291bnRzIGZyb20gaW5wdXQgZG9jdW1lbnQuXG4gKiBAcHJvcGVydHkge251bWJlcn0gc2VudGVuY2VcbiAqICAgTnVtYmVyIG9mIHNlbnRlbmNlcy5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3b3JkXG4gKiAgIE51bWJlciBvZiB3b3Jkcy5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBzeWxsYWJsZVxuICogICBOdW1iZXIgb2Ygc3lsbGFibGVzLlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge0NvdW50c30gRmxlc2NoQ291bnRzXG4gKiAgIERlcHJlY2F0ZWQ6IHBsZWFzZSB1c2UgdGhlIGBDb3VudHNgIHR5cGUgaW5zdGVhZC5cbiAqL1xuXG5jb25zdCBzZW50ZW5jZVdlaWdodCA9IDEuMDE1XG5jb25zdCB3b3JkV2VpZ2h0ID0gODQuNlxuY29uc3QgYmFzZSA9IDIwNi44MzVcblxuLyoqXG4gKiBHaXZlbiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbnVtYmVyIG9mIHdvcmRzIChgd29yZGApLCB0aGUgbnVtYmVyIG9mXG4gKiBzZW50ZW5jZXMgKGBzZW50ZW5jZWApLCBhbmQgdGhlIG51bWJlciBvZiBzeWxsYWJsZXMgIChgc3lsbGFibGVgKSBpbiBhXG4gKiBkb2N1bWVudCwgcmV0dXJucyB0aGUgcmVhZGluZyBlYXNlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZG9jdW1lbnQuXG4gKlxuICogQHBhcmFtIHtDb3VudHN9IGNvdW50c1xuICogICBDb3VudHMgZnJvbSBpbnB1dCBkb2N1bWVudC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKiAgIFJlc3VsdCBpcyBgMTIwYCAoZXZlcnkgc2VudGVuY2UgY29uc2lzdGluZyBvZiBvbmx5IHR3byBvbmUtc3lsbGFibGUgd29yZHMpXG4gKiAgIG9yIGxvd2VyIChpbmNsdWRpbmcgbmVnYXRpdmUgdmFsdWVzKS5cbiAqXG4gKiAgIFRoZSB2YWx1ZXMgaGF2ZSB0aGUgZm9sbG93aW5nIHNlbWFudGljczpcbiAqXG4gKiAgIHwgICAgIFNjb3JlICAgIHwgU2VtYW50aWNzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICAgfCA6LS0tLS0tLS0tLTogfCA6LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gfFxuICogICB8IDkwLjAg4oCTIDEwMC4wIHwgRWFzaWx5IHVuZGVyc3Rvb2QgYnkgYW4gYXZlcmFnZSAxMS15ZWFyLW9sZCBzdHVkZW50IHxcbiAqICAgfCAgNjAuMCDigJMgNzAuMCB8IEVhc2lseSB1bmRlcnN0b29kIGJ5IDEzLSB0byAxNS15ZWFyLW9sZCBzdHVkZW50cyAgICB8XG4gKiAgIHwgIDAuMCDigJMgMzAuMCAgfCBCZXN0IHVuZGVyc3Rvb2QgYnkgdW5pdmVyc2l0eSBncmFkdWF0ZXMgICAgICAgICAgICAgfFxuICpcbiAqICAgVGhlcmVmb3JlIHdlIGNhbiB1c2UgdGhlIGZvbGxvd2luZyBmb3JtdWxhIHRvIGFwcHJveGltYXRlIHRoZSBhdmVyYWdlIGFnZVxuICogICBhIHN0dWRlbnQgd291bGQgdW5kZXJzdGFuZCBhIGRvY3VtZW50IGF0LCBnaXZlbiBzY29yZSBgc2NvcmVgOlxuICpcbiAqICAgYGBganNcbiAqICAgY29uc3QgYWdlID0gMjAgLSBNYXRoLmZsb29yKHNjb3JlIC8gMTApXG4gKiAgIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZmxlc2NoKGNvdW50cykge1xuICBpZiAoIWNvdW50cyB8fCAhY291bnRzLnNlbnRlbmNlIHx8ICFjb3VudHMud29yZCB8fCAhY291bnRzLnN5bGxhYmxlKSB7XG4gICAgcmV0dXJuIE51bWJlci5OYU5cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgYmFzZSAtXG4gICAgc2VudGVuY2VXZWlnaHQgKiAoY291bnRzLndvcmQgLyBjb3VudHMuc2VudGVuY2UpIC1cbiAgICB3b3JkV2VpZ2h0ICogKGNvdW50cy5zeWxsYWJsZSAvIGNvdW50cy53b3JkKVxuICApXG59XG4iLCJleHBvcnQgY29uc3QgTUFUQ0hfSFRNTF9DT01NRU5UID0gbmV3IFJlZ0V4cChcbiAgXCI8IS0tW1xcXFxzXFxcXFNdKj8oPzotLT4pP1wiICtcbiAgICAgIFwiPCEtLS0rPj9cIiArXG4gICAgICBcInw8ISg/IVtkRF1bb09dW2NDXVt0VF1beVldW3BQXVtlRV18XFxcXFtDREFUQVxcXFxbKVtePl0qPj9cIiArXG4gICAgICBcInw8Wz9dW14+XSo+P1wiLFxuICBcImdcIlxuICApO1xuZXhwb3J0IGNvbnN0IE1BVENIX0NPTU1FTlQgPSBuZXcgUmVnRXhwKFwiJSVbXiUlXSslJVwiLCBcImdcIik7XG5leHBvcnQgY29uc3QgTUFUQ0hfUEFSQUdSQVBIID0gbmV3IFJlZ0V4cChcIlxcbihbXlxcbl0rKVxcblwiLCBcImdcIik7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRXb3JkQ291bnQodGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgY29uc3Qgc3BhY2VEZWxpbWl0ZWRDaGFycyA9XG4gICAgLyfigJlBLVphLXpcXHUwMEFBXFx1MDBCNVxcdTAwQkFcXHUwMEMwLVxcdTAwRDZcXHUwMEQ4LVxcdTAwRjZcXHUwMEY4LVxcdTAyQzFcXHUwMkM2LVxcdTAyRDFcXHUwMkUwLVxcdTAyRTRcXHUwMkVDXFx1MDJFRVxcdTAzNzAtXFx1MDM3NFxcdTAzNzZcXHUwMzc3XFx1MDM3QS1cXHUwMzdEXFx1MDM3RlxcdTAzODZcXHUwMzg4LVxcdTAzOEFcXHUwMzhDXFx1MDM4RS1cXHUwM0ExXFx1MDNBMy1cXHUwM0Y1XFx1MDNGNy1cXHUwNDgxXFx1MDQ4QS1cXHUwNTJGXFx1MDUzMS1cXHUwNTU2XFx1MDU1OVxcdTA1NjEtXFx1MDU4N1xcdTA1RDAtXFx1MDVFQVxcdTA1RjAtXFx1MDVGMlxcdTA2MjAtXFx1MDY0QVxcdTA2NkVcXHUwNjZGXFx1MDY3MS1cXHUwNkQzXFx1MDZENVxcdTA2RTVcXHUwNkU2XFx1MDZFRVxcdTA2RUZcXHUwNkZBLVxcdTA2RkNcXHUwNkZGXFx1MDcxMFxcdTA3MTItXFx1MDcyRlxcdTA3NEQtXFx1MDdBNVxcdTA3QjFcXHUwN0NBLVxcdTA3RUFcXHUwN0Y0XFx1MDdGNVxcdTA3RkFcXHUwODAwLVxcdTA4MTVcXHUwODFBXFx1MDgyNFxcdTA4MjhcXHUwODQwLVxcdTA4NThcXHUwOEEwLVxcdTA4QjRcXHUwOTA0LVxcdTA5MzlcXHUwOTNEXFx1MDk1MFxcdTA5NTgtXFx1MDk2MVxcdTA5NzEtXFx1MDk4MFxcdTA5ODUtXFx1MDk4Q1xcdTA5OEZcXHUwOTkwXFx1MDk5My1cXHUwOUE4XFx1MDlBQS1cXHUwOUIwXFx1MDlCMlxcdTA5QjYtXFx1MDlCOVxcdTA5QkRcXHUwOUNFXFx1MDlEQ1xcdTA5RERcXHUwOURGLVxcdTA5RTFcXHUwOUYwXFx1MDlGMVxcdTBBMDUtXFx1MEEwQVxcdTBBMEZcXHUwQTEwXFx1MEExMy1cXHUwQTI4XFx1MEEyQS1cXHUwQTMwXFx1MEEzMlxcdTBBMzNcXHUwQTM1XFx1MEEzNlxcdTBBMzhcXHUwQTM5XFx1MEE1OS1cXHUwQTVDXFx1MEE1RVxcdTBBNzItXFx1MEE3NFxcdTBBODUtXFx1MEE4RFxcdTBBOEYtXFx1MEE5MVxcdTBBOTMtXFx1MEFBOFxcdTBBQUEtXFx1MEFCMFxcdTBBQjJcXHUwQUIzXFx1MEFCNS1cXHUwQUI5XFx1MEFCRFxcdTBBRDBcXHUwQUUwXFx1MEFFMVxcdTBBRjlcXHUwQjA1LVxcdTBCMENcXHUwQjBGXFx1MEIxMFxcdTBCMTMtXFx1MEIyOFxcdTBCMkEtXFx1MEIzMFxcdTBCMzJcXHUwQjMzXFx1MEIzNS1cXHUwQjM5XFx1MEIzRFxcdTBCNUNcXHUwQjVEXFx1MEI1Ri1cXHUwQjYxXFx1MEI3MVxcdTBCODNcXHUwQjg1LVxcdTBCOEFcXHUwQjhFLVxcdTBCOTBcXHUwQjkyLVxcdTBCOTVcXHUwQjk5XFx1MEI5QVxcdTBCOUNcXHUwQjlFXFx1MEI5RlxcdTBCQTNcXHUwQkE0XFx1MEJBOC1cXHUwQkFBXFx1MEJBRS1cXHUwQkI5XFx1MEJEMFxcdTBDMDUtXFx1MEMwQ1xcdTBDMEUtXFx1MEMxMFxcdTBDMTItXFx1MEMyOFxcdTBDMkEtXFx1MEMzOVxcdTBDM0RcXHUwQzU4LVxcdTBDNUFcXHUwQzYwXFx1MEM2MVxcdTBDODUtXFx1MEM4Q1xcdTBDOEUtXFx1MEM5MFxcdTBDOTItXFx1MENBOFxcdTBDQUEtXFx1MENCM1xcdTBDQjUtXFx1MENCOVxcdTBDQkRcXHUwQ0RFXFx1MENFMFxcdTBDRTFcXHUwQ0YxXFx1MENGMlxcdTBEMDUtXFx1MEQwQ1xcdTBEMEUtXFx1MEQxMFxcdTBEMTItXFx1MEQzQVxcdTBEM0RcXHUwRDRFXFx1MEQ1Ri1cXHUwRDYxXFx1MEQ3QS1cXHUwRDdGXFx1MEQ4NS1cXHUwRDk2XFx1MEQ5QS1cXHUwREIxXFx1MERCMy1cXHUwREJCXFx1MERCRFxcdTBEQzAtXFx1MERDNlxcdTBFMDEtXFx1MEUzMFxcdTBFMzJcXHUwRTMzXFx1MEU0MC1cXHUwRTQ2XFx1MEU4MVxcdTBFODJcXHUwRTg0XFx1MEU4N1xcdTBFODhcXHUwRThBXFx1MEU4RFxcdTBFOTQtXFx1MEU5N1xcdTBFOTktXFx1MEU5RlxcdTBFQTEtXFx1MEVBM1xcdTBFQTVcXHUwRUE3XFx1MEVBQVxcdTBFQUJcXHUwRUFELVxcdTBFQjBcXHUwRUIyXFx1MEVCM1xcdTBFQkRcXHUwRUMwLVxcdTBFQzRcXHUwRUM2XFx1MEVEQy1cXHUwRURGXFx1MEYwMFxcdTBGNDAtXFx1MEY0N1xcdTBGNDktXFx1MEY2Q1xcdTBGODgtXFx1MEY4Q1xcdTEwMDAtXFx1MTAyQVxcdTEwM0ZcXHUxMDUwLVxcdTEwNTVcXHUxMDVBLVxcdTEwNURcXHUxMDYxXFx1MTA2NVxcdTEwNjZcXHUxMDZFLVxcdTEwNzBcXHUxMDc1LVxcdTEwODFcXHUxMDhFXFx1MTBBMC1cXHUxMEM1XFx1MTBDN1xcdTEwQ0RcXHUxMEQwLVxcdTEwRkFcXHUxMEZDLVxcdTEyNDhcXHUxMjRBLVxcdTEyNERcXHUxMjUwLVxcdTEyNTZcXHUxMjU4XFx1MTI1QS1cXHUxMjVEXFx1MTI2MC1cXHUxMjg4XFx1MTI4QS1cXHUxMjhEXFx1MTI5MC1cXHUxMkIwXFx1MTJCMi1cXHUxMkI1XFx1MTJCOC1cXHUxMkJFXFx1MTJDMFxcdTEyQzItXFx1MTJDNVxcdTEyQzgtXFx1MTJENlxcdTEyRDgtXFx1MTMxMFxcdTEzMTItXFx1MTMxNVxcdTEzMTgtXFx1MTM1QVxcdTEzODAtXFx1MTM4RlxcdTEzQTAtXFx1MTNGNVxcdTEzRjgtXFx1MTNGRFxcdTE0MDEtXFx1MTY2Q1xcdTE2NkYtXFx1MTY3RlxcdTE2ODEtXFx1MTY5QVxcdTE2QTAtXFx1MTZFQVxcdTE2RjEtXFx1MTZGOFxcdTE3MDAtXFx1MTcwQ1xcdTE3MEUtXFx1MTcxMVxcdTE3MjAtXFx1MTczMVxcdTE3NDAtXFx1MTc1MVxcdTE3NjAtXFx1MTc2Q1xcdTE3NkUtXFx1MTc3MFxcdTE3ODAtXFx1MTdCM1xcdTE3RDdcXHUxN0RDXFx1MTgyMC1cXHUxODc3XFx1MTg4MC1cXHUxOEE4XFx1MThBQVxcdTE4QjAtXFx1MThGNVxcdTE5MDAtXFx1MTkxRVxcdTE5NTAtXFx1MTk2RFxcdTE5NzAtXFx1MTk3NFxcdTE5ODAtXFx1MTlBQlxcdTE5QjAtXFx1MTlDOVxcdTFBMDAtXFx1MUExNlxcdTFBMjAtXFx1MUE1NFxcdTFBQTdcXHUxQjA1LVxcdTFCMzNcXHUxQjQ1LVxcdTFCNEJcXHUxQjgzLVxcdTFCQTBcXHUxQkFFXFx1MUJBRlxcdTFCQkEtXFx1MUJFNVxcdTFDMDAtXFx1MUMyM1xcdTFDNEQtXFx1MUM0RlxcdTFDNUEtXFx1MUM3RFxcdTFDRTktXFx1MUNFQ1xcdTFDRUUtXFx1MUNGMVxcdTFDRjVcXHUxQ0Y2XFx1MUQwMC1cXHUxREJGXFx1MUUwMC1cXHUxRjE1XFx1MUYxOC1cXHUxRjFEXFx1MUYyMC1cXHUxRjQ1XFx1MUY0OC1cXHUxRjREXFx1MUY1MC1cXHUxRjU3XFx1MUY1OVxcdTFGNUJcXHUxRjVEXFx1MUY1Ri1cXHUxRjdEXFx1MUY4MC1cXHUxRkI0XFx1MUZCNi1cXHUxRkJDXFx1MUZCRVxcdTFGQzItXFx1MUZDNFxcdTFGQzYtXFx1MUZDQ1xcdTFGRDAtXFx1MUZEM1xcdTFGRDYtXFx1MUZEQlxcdTFGRTAtXFx1MUZFQ1xcdTFGRjItXFx1MUZGNFxcdTFGRjYtXFx1MUZGQ1xcdTIwNzFcXHUyMDdGXFx1MjA5MC1cXHUyMDlDXFx1MjEwMlxcdTIxMDdcXHUyMTBBLVxcdTIxMTNcXHUyMTE1XFx1MjExOS1cXHUyMTFEXFx1MjEyNFxcdTIxMjZcXHUyMTI4XFx1MjEyQS1cXHUyMTJEXFx1MjEyRi1cXHUyMTM5XFx1MjEzQy1cXHUyMTNGXFx1MjE0NS1cXHUyMTQ5XFx1MjE0RVxcdTIxODNcXHUyMTg0XFx1MkMwMC1cXHUyQzJFXFx1MkMzMC1cXHUyQzVFXFx1MkM2MC1cXHUyQ0U0XFx1MkNFQi1cXHUyQ0VFXFx1MkNGMlxcdTJDRjNcXHUyRDAwLVxcdTJEMjVcXHUyRDI3XFx1MkQyRFxcdTJEMzAtXFx1MkQ2N1xcdTJENkZcXHUyRDgwLVxcdTJEOTZcXHUyREEwLVxcdTJEQTZcXHUyREE4LVxcdTJEQUVcXHUyREIwLVxcdTJEQjZcXHUyREI4LVxcdTJEQkVcXHUyREMwLVxcdTJEQzZcXHUyREM4LVxcdTJEQ0VcXHUyREQwLVxcdTJERDZcXHUyREQ4LVxcdTJEREVcXHUyRTJGXFx1MzAwNVxcdTMwMDZcXHUzMDMxLVxcdTMwMzVcXHUzMDNCXFx1MzAzQ1xcdTMxMDUtXFx1MzEyRFxcdTMxMzEtXFx1MzE4RVxcdTMxQTAtXFx1MzFCQVxcdTMxRjAtXFx1MzFGRlxcdTM0MDAtXFx1NERCNVxcdUEwMDAtXFx1QTQ4Q1xcdUE0RDAtXFx1QTRGRFxcdUE1MDAtXFx1QTYwQ1xcdUE2MTAtXFx1QTYxRlxcdUE2MkFcXHVBNjJCXFx1QTY0MC1cXHVBNjZFXFx1QTY3Ri1cXHVBNjlEXFx1QTZBMC1cXHVBNkU1XFx1QTcxNy1cXHVBNzFGXFx1QTcyMi1cXHVBNzg4XFx1QTc4Qi1cXHVBN0FEXFx1QTdCMC1cXHVBN0I3XFx1QTdGNy1cXHVBODAxXFx1QTgwMy1cXHVBODA1XFx1QTgwNy1cXHVBODBBXFx1QTgwQy1cXHVBODIyXFx1QTg0MC1cXHVBODczXFx1QTg4Mi1cXHVBOEIzXFx1QThGMi1cXHVBOEY3XFx1QThGQlxcdUE4RkRcXHVBOTBBLVxcdUE5MjVcXHVBOTMwLVxcdUE5NDZcXHVBOTYwLVxcdUE5N0NcXHVBOTg0LVxcdUE5QjJcXHVBOUNGXFx1QTlFMC1cXHVBOUU0XFx1QTlFNi1cXHVBOUVGXFx1QTlGQS1cXHVBOUZFXFx1QUEwMC1cXHVBQTI4XFx1QUE0MC1cXHVBQTQyXFx1QUE0NC1cXHVBQTRCXFx1QUE2MC1cXHVBQTc2XFx1QUE3QVxcdUFBN0UtXFx1QUFBRlxcdUFBQjFcXHVBQUI1XFx1QUFCNlxcdUFBQjktXFx1QUFCRFxcdUFBQzBcXHVBQUMyXFx1QUFEQi1cXHVBQUREXFx1QUFFMC1cXHVBQUVBXFx1QUFGMi1cXHVBQUY0XFx1QUIwMS1cXHVBQjA2XFx1QUIwOS1cXHVBQjBFXFx1QUIxMS1cXHVBQjE2XFx1QUIyMC1cXHVBQjI2XFx1QUIyOC1cXHVBQjJFXFx1QUIzMC1cXHVBQjVBXFx1QUI1Qy1cXHVBQjY1XFx1QUI3MC1cXHVBQkUyXFx1QUMwMC1cXHVEN0EzXFx1RDdCMC1cXHVEN0M2XFx1RDdDQi1cXHVEN0ZCXFx1RjkwMC1cXHVGQTZEXFx1RkE3MC1cXHVGQUQ5XFx1RkIwMC1cXHVGQjA2XFx1RkIxMy1cXHVGQjE3XFx1RkIxRFxcdUZCMUYtXFx1RkIyOFxcdUZCMkEtXFx1RkIzNlxcdUZCMzgtXFx1RkIzQ1xcdUZCM0VcXHVGQjQwXFx1RkI0MVxcdUZCNDNcXHVGQjQ0XFx1RkI0Ni1cXHVGQkIxXFx1RkJEMy1cXHVGRDNEXFx1RkQ1MC1cXHVGRDhGXFx1RkQ5Mi1cXHVGREM3XFx1RkRGMC1cXHVGREZCXFx1RkU3MC1cXHVGRTc0XFx1RkU3Ni1cXHVGRUZDXFx1RkYyMS1cXHVGRjNBXFx1RkY0MS1cXHVGRjVBXFx1RkY2Ni1cXHVGRkJFXFx1RkZDMi1cXHVGRkM3XFx1RkZDQS1cXHVGRkNGXFx1RkZEMi1cXHVGRkQ3XFx1RkZEQS1cXHVGRkRDL1xuICAgICAgLnNvdXJjZTtcbiAgY29uc3Qgbm9uU3BhY2VEZWxpbWl0ZWRXb3JkcyA9XG4gICAgL1xcdTMwNDEtXFx1MzA5NlxcdTMwOUQtXFx1MzA5RlxcdTMwQTEtXFx1MzBGQVxcdTMwRkMtXFx1MzBGRlxcdTRFMDAtXFx1OUZENS8uc291cmNlO1xuXG4gIGNvbnN0IG5vblNwYWNlRGVsaW1pdGVkV29yZHNPdGhlciA9XG4gICAgL1tcXHUzMDQxLVxcdTMwOTZcXHUzMDlELVxcdTMwOUZcXHUzMEExLVxcdTMwRkFcXHUzMEZDLVxcdTMwRkZcXHU0RTAwLVxcdTlGRDVdezF9L1xuICAgICAgLnNvdXJjZTtcblxuICBjb25zdCBwYXR0ZXJuID0gbmV3IFJlZ0V4cChcbiAgICBbXG4gICAgICBgKD86WzAtOV0rKD86KD86LHxcXFxcLilbMC05XSspKnxbXFxcXC0ke3NwYWNlRGVsaW1pdGVkQ2hhcnN9XSkrYCxcbiAgICAgIG5vblNwYWNlRGVsaW1pdGVkV29yZHMsXG4gICAgICBub25TcGFjZURlbGltaXRlZFdvcmRzT3RoZXIsXG4gICAgXS5qb2luKFwifFwiKSxcbiAgICBcImdcIlxuICApO1xuICByZXR1cm4gKHRleHQubWF0Y2gocGF0dGVybikgfHwgW10pLmxlbmd0aDtcbn1cbiAgXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2hhcmFjdGVyQ291bnQodGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGV4dC5sZW5ndGg7XG4gIH1cbiAgXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VudGVuY2VDb3VudCh0ZXh0OiBzdHJpbmcpOiBudW1iZXIge1xuICBjb25zdCBzZW50ZW5jZXM6IG51bWJlciA9IChcbiAgICAodGV4dCB8fCBcIlwiKS5tYXRjaChcbiAgICAgIC9bXi4hP1xcc11bXi4hP10qKD86Wy4hP10oPyFbJ1wiXT9cXHN8JClbXi4hP10qKSpbLiE/XT9bJ1wiXT8oPz1cXHN8JCkvZ21cbiAgICApIHx8IFtdXG4gICkubGVuZ3RoO1xuXG4gIHJldHVybiBzZW50ZW5jZXM7XG59XG4gIFxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuQ29tbWVudHModGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHRleHQucmVwbGFjZShNQVRDSF9DT01NRU5ULCBcIlwiKS5yZXBsYWNlKE1BVENIX0hUTUxfQ09NTUVOVCwgXCJcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRGUkUoc2NvcmU6IG51bWJlcik6IHN0cmluZyB7XG4gIGNvbnN0IHJvdW5kZWQgPSBNYXRoLnJvdW5kKHNjb3JlICogMTAwKSAvIDEwMFxuICBsZXQgb3V0cHV0ID0gJydcbiAgc3dpdGNoICh0cnVlKSB7XG4gICAgY2FzZSAoOTAgPD0gcm91bmRlZCk6XG4gICAgICBvdXRwdXQgPSByb3VuZGVkICsgJywgb3IgXCJ2ZXJ5IGVhc3kgdG8gcmVhZFwiJ1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAoODAgPD0gcm91bmRlZCk6XG4gICAgICBvdXRwdXQgPSByb3VuZGVkICsgJywgb3IgXCJlYXN5IHRvIHJlYWRcIidcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgKDcwIDw9IHJvdW5kZWQpOlxuICAgICAgb3V0cHV0ID0gcm91bmRlZCArICcsIG9yIFwiZmFpcmx5IGVhc3kgdG8gcmVhZFwiJ1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAoNjAgPD0gcm91bmRlZCk6XG4gICAgICBvdXRwdXQgPSByb3VuZGVkICsgJywgb3IgXCJwbGFpbiBFbmdsaXNoXCInXG4gICAgICBicmVhazsgIFxuICAgIGNhc2UgKDUwIDw9IHJvdW5kZWQpOlxuICAgICAgb3V0cHV0ID0gcm91bmRlZCArICcsIG9yIFwiZmFpcmx5IGRpZmZpY3VsdCB0byByZWFkXCInXG4gICAgICBicmVhaztcbiAgICBjYXNlICgzMCA8PSByb3VuZGVkKTpcbiAgICAgIG91dHB1dCA9IHJvdW5kZWQgKyAnLCBvciBcImRpZmZpY3VsdCB0byByZWFkXCInXG4gICAgICBicmVhaztcbiAgICBjYXNlICgxMCA8PSByb3VuZGVkKTpcbiAgICAgIG91dHB1dCA9IHJvdW5kZWQgKyAnLCBvciBcInZlcnkgZGlmZmljdWx0IHRvIHJlYWRcIidcbiAgICAgIGJyZWFrOyAgICAgIFxuICB9XG5cbiAgcmV0dXJuICdyOXk6ICcgKyBvdXRwdXRcbn0iLCJpbXBvcnQgeyBkZWJvdW5jZSB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IFJlbW92ZU1hcmtkb3duIGZyb20gXCJyZW1vdmUtbWFya2Rvd25cIjtcbmltcG9ydCB7c3lsbGFibGV9IGZyb20gXCJzeWxsYWJsZVwiXG5pbXBvcnQge2ZsZXNjaH0gZnJvbSAnZmxlc2NoJ1xuaW1wb3J0IHsgZ2V0V29yZENvdW50LCBnZXRTZW50ZW5jZUNvdW50LCBmb3JtYXRGUkUgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0dXNCYXIge1xuICBwcml2YXRlIHN0YXR1c0JhckVsOiBIVE1MRWxlbWVudDtcbiAgcHVibGljIGRlYm91bmNlU3RhdHVzQmFyVXBkYXRlO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXR1c0JhckVsOiBIVE1MRWxlbWVudCkge1xuICAgIHRoaXMuc3RhdHVzQmFyRWwgPSBzdGF0dXNCYXJFbDtcbiAgICB0aGlzLmRlYm91bmNlU3RhdHVzQmFyVXBkYXRlID0gZGVib3VuY2UoXG4gICAgICAodGV4dDogc3RyaW5nKSA9PiB0aGlzLnVwZGF0ZVN0YXR1c0Jhcih0ZXh0KSxcbiAgICAgIDIwLFxuICAgICAgZmFsc2VcbiAgICApO1xuXG4gICAgdGhpcy5zdGF0dXNCYXJFbC5jbGFzc0xpc3QuYWRkKFwibW9kLWNsaWNrYWJsZVwiKTtcbiAgICB0aGlzLnN0YXR1c0JhckVsLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgXCIhISFcIik7XG4gICAgdGhpcy5zdGF0dXNCYXJFbC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsLXBvc2l0aW9uXCIsIFwidG9wXCIpO1xuICAgIHRoaXMuc3RhdHVzQmFyRWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldjogTW91c2VFdmVudCkgPT5cbiAgICAgIHRoaXMub25DbGljayhldilcbiAgICApO1xuICB9XG5cbiAgb25DbGljayhldjogTW91c2VFdmVudCkge1xuICAgIGV2O1xuICB9XG5cbiAgZGlzcGxheVRleHQodGV4dDogc3RyaW5nKSB7XG4gICAgdGhpcy5zdGF0dXNCYXJFbC5zZXRUZXh0KHRleHQpO1xuICB9XG5cbiAgYXN5bmMgdXBkYXRlU3RhdHVzQmFyKHRleHQ6IHN0cmluZykge1xuICAgIGNvbnN0IHBsYWluVGV4dCA9IFJlbW92ZU1hcmtkb3duKHRleHQsIHtcbiAgICAgIHN0cmlwTGlzdExlYWRlcnM6IHRydWUgLCAvLyBzdHJpcCBsaXN0IGxlYWRlcnMgKGRlZmF1bHQ6IHRydWUpXG4gICAgICBsaXN0VW5pY29kZUNoYXI6ICcnLCAgICAgLy8gY2hhciB0byBpbnNlcnQgaW5zdGVhZCBvZiBzdHJpcHBlZCBsaXN0IGxlYWRlcnMgKGRlZmF1bHQ6ICcnKVxuICAgICAgZ2ZtOiB0cnVlLCAgICAgICAgICAgICAgICAvLyBzdXBwb3J0IEdpdEh1Yi1GbGF2b3JlZCBNYXJrZG93biAoZGVmYXVsdDogdHJ1ZSlcbiAgICAgIHVzZUltZ0FsdFRleHQ6IHRydWUgICAgICAvLyByZXBsYWNlIGltYWdlcyB3aXRoIGFsdC10ZXh0LCBpZiBwcmVzZW50IChkZWZhdWx0OiB0cnVlKVxuICAgIH0pO1xuXG4gICAgY29uc3Qgc3lsbGFibGVzID0gc3lsbGFibGUocGxhaW5UZXh0KVxuICAgIGNvbnN0IHdvcmRzID0gZ2V0V29yZENvdW50KHBsYWluVGV4dClcbiAgICBjb25zdCBzZW50ZW5jZXMgPSBnZXRTZW50ZW5jZUNvdW50KHBsYWluVGV4dClcbiAgICBjb25zdCBmbGVzY2hDb3VudCA9IGZsZXNjaCh7c2VudGVuY2U6IHNlbnRlbmNlcywgd29yZDogd29yZHMsIHN5bGxhYmxlOiBzeWxsYWJsZXN9KVxuICAgIGNvbnN0IG91dHB1dCA9IGZvcm1hdEZSRShmbGVzY2hDb3VudClcbiAgICBcbiAgICB0aGlzLmRpc3BsYXlUZXh0KG91dHB1dCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IFRyYW5zYWN0aW9uIH0gZnJvbSBcIkBjb2RlbWlycm9yL3N0YXRlXCI7XG5pbXBvcnQge1xuICBWaWV3VXBkYXRlLFxuICBQbHVnaW5WYWx1ZSxcbiAgRWRpdG9yVmlldyxcbiAgVmlld1BsdWdpbixcbn0gZnJvbSBcIkBjb2RlbWlycm9yL3ZpZXdcIjtcbmltcG9ydCB0eXBlIFJlYWRhYmlsaXR5IGZyb20gXCJzcmMvbWFpblwiO1xuXG5jbGFzcyBFZGl0b3JQbHVnaW4gaW1wbGVtZW50cyBQbHVnaW5WYWx1ZSB7XG4gIGhhc1BsdWdpbjogYm9vbGVhbjtcbiAgdmlldzogRWRpdG9yVmlldztcbiAgcHJpdmF0ZSBwbHVnaW46IFJlYWRhYmlsaXR5O1xuXG4gIGNvbnN0cnVjdG9yKHZpZXc6IEVkaXRvclZpZXcpIHtcbiAgICB0aGlzLnZpZXcgPSB2aWV3O1xuICAgIHRoaXMuaGFzUGx1Z2luID0gZmFsc2U7XG4gIH1cblxuICB1cGRhdGUodXBkYXRlOiBWaWV3VXBkYXRlKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmhhc1BsdWdpbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRyID0gdXBkYXRlLnRyYW5zYWN0aW9uc1swXTtcblxuICAgIGlmICghdHIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VyRXZlbnRUeXBlVW5kZWZpbmVkID1cbiAgICAgIHRyLmFubm90YXRpb24oVHJhbnNhY3Rpb24udXNlckV2ZW50KSA9PT0gdW5kZWZpbmVkO1xuXG4gICAgaWYgKFxuICAgICAgKHRyLmlzVXNlckV2ZW50KFwic2VsZWN0XCIpIHx8IHVzZXJFdmVudFR5cGVVbmRlZmluZWQpICYmXG4gICAgICB0ci5uZXdTZWxlY3Rpb24ucmFuZ2VzWzBdLmZyb20gIT09IHRyLm5ld1NlbGVjdGlvbi5yYW5nZXNbMF0udG9cbiAgICApIHtcbiAgICAgIGxldCB0ZXh0ID0gXCJcIjtcbiAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IHRyLm5ld1NlbGVjdGlvbi5tYWluO1xuICAgICAgY29uc3QgdGV4dEl0ZXIgPSB0ci5uZXdEb2MuaXRlclJhbmdlKHNlbGVjdGlvbi5mcm9tLCBzZWxlY3Rpb24udG8pO1xuICAgICAgd2hpbGUgKCF0ZXh0SXRlci5kb25lKSB7XG4gICAgICAgIHRleHQgPSB0ZXh0ICsgdGV4dEl0ZXIubmV4dCgpLnZhbHVlO1xuICAgICAgfVxuICAgICAgdGhpcy5wbHVnaW4uc3RhdHVzQmFyLmRlYm91bmNlU3RhdHVzQmFyVXBkYXRlKHRleHQpO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0ci5pc1VzZXJFdmVudChcImlucHV0XCIpIHx8XG4gICAgICB0ci5pc1VzZXJFdmVudChcImRlbGV0ZVwiKSB8fFxuICAgICAgdHIuaXNVc2VyRXZlbnQoXCJtb3ZlXCIpIHx8XG4gICAgICB0ci5pc1VzZXJFdmVudChcInVuZG9cIikgfHxcbiAgICAgIHRyLmlzVXNlckV2ZW50KFwicmVkb1wiKSB8fFxuICAgICAgdHIuaXNVc2VyRXZlbnQoXCJzZWxlY3RcIilcbiAgICApIHtcbiAgICAgIGNvbnN0IHRleHRJdGVyID0gdHIubmV3RG9jLml0ZXIoKTtcbiAgICAgIGxldCB0ZXh0ID0gXCJcIjtcbiAgICAgIHdoaWxlICghdGV4dEl0ZXIuZG9uZSkge1xuICAgICAgICB0ZXh0ID0gdGV4dCArIHRleHRJdGVyLm5leHQoKS52YWx1ZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wbHVnaW4uc3RhdHVzQmFyLmRlYm91bmNlU3RhdHVzQmFyVXBkYXRlKHRleHQpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFBsdWdpbihwbHVnaW46IFJlYWRhYmlsaXR5KSB7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgdGhpcy5oYXNQbHVnaW4gPSB0cnVlO1xuICB9XG5cbiAgZGVzdHJveSgpIHt9XG59XG5cbmV4cG9ydCBjb25zdCBlZGl0b3JQbHVnaW4gPSBWaWV3UGx1Z2luLmZyb21DbGFzcyhFZGl0b3JQbHVnaW4pO1xuIiwiaW1wb3J0IHsgUGx1Z2luLCBXb3Jrc3BhY2VMZWFmIH0gZnJvbSBcIm9ic2lkaWFuXCI7XHJcbmltcG9ydCBTdGF0dXNCYXIgZnJvbSBcIi4vU3RhdHVzQmFyXCI7XHJcbmltcG9ydCB0eXBlIHsgRWRpdG9yVmlldyB9IGZyb20gXCJAY29kZW1pcnJvci92aWV3XCI7XHJcbmltcG9ydCB7IGVkaXRvclBsdWdpbiB9IGZyb20gXCIuL0VkaXRvclBsdWdpblwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhZGFiaWxpdHkgZXh0ZW5kcyBQbHVnaW4ge1xyXG4gIHB1YmxpYyBzdGF0dXNCYXI6IFN0YXR1c0JhcjtcclxuXHJcbiAgYXN5bmMgb251bmxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICB0aGlzLnN0YXR1c0JhciA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBhc3luYyBvbmxvYWQoKSB7XHJcbiAgICAvLyBIYW5kbGUgU3RhdHVzIEJhclxyXG4gICAgbGV0IHN0YXR1c0JhckVsID0gdGhpcy5hZGRTdGF0dXNCYXJJdGVtKCk7XHJcbiAgICB0aGlzLnN0YXR1c0JhciA9IG5ldyBTdGF0dXNCYXIoc3RhdHVzQmFyRWwpO1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgRWRpdG9yIFBsdWdpblxyXG4gICAgdGhpcy5yZWdpc3RlckVkaXRvckV4dGVuc2lvbihlZGl0b3JQbHVnaW4pO1xyXG5cclxuICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbkxheW91dFJlYWR5KCgpID0+IHtcclxuICAgICAgdGhpcy5naXZlRWRpdG9yUGx1Z2luKHRoaXMuYXBwLndvcmtzcGFjZS5nZXRNb3N0UmVjZW50TGVhZigpKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMucmVnaXN0ZXJFdmVudChcclxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9uKFxyXG4gICAgICAgIFwiYWN0aXZlLWxlYWYtY2hhbmdlXCIsXHJcbiAgICAgICAgYXN5bmMgKGxlYWY6IFdvcmtzcGFjZUxlYWYpID0+IHtcclxuICAgICAgICAgIHRoaXMuZ2l2ZUVkaXRvclBsdWdpbihsZWFmKTtcclxuICAgICAgICAgIGlmIChsZWFmLnZpZXcuZ2V0Vmlld1R5cGUoKSAhPT0gXCJtYXJrZG93blwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzQmFyLnVwZGF0ZVN0YXR1c0JhcignJyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGdpdmVFZGl0b3JQbHVnaW4obGVhZjogV29ya3NwYWNlTGVhZik6IHZvaWQge1xyXG4gICAgLy9AdHMtZXhwZWN0LWVycm9yLCBub3QgdHlwZWRcclxuICAgIGNvbnN0IGVkaXRvciA9IGxlYWY/LnZpZXc/LmVkaXRvcjtcclxuICAgIGlmIChlZGl0b3IpIHtcclxuICAgICAgY29uc3QgZWRpdG9yVmlldyA9IGVkaXRvci5jbSBhcyBFZGl0b3JWaWV3O1xyXG4gICAgICBjb25zdCBlZGl0b3JQbHVnID0gZWRpdG9yVmlldy5wbHVnaW4oZWRpdG9yUGx1Z2luKTtcclxuICAgICAgZWRpdG9yUGx1Zy5hZGRQbHVnaW4odGhpcyk7XHJcbiAgICAgIC8vQHRzLWV4cGVjdC1lcnJvciwgbm90IHR5cGVkXHJcbiAgICAgIGNvbnN0IGRhdGE6IHN0cmluZyA9IGxlYWYudmlldy5kYXRhO1xyXG4gICAgICB0aGlzLnN0YXR1c0Jhci51cGRhdGVTdGF0dXNCYXIoZGF0YSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJyZXF1aXJlIiwidGhpcyIsImRlYm91bmNlIiwiUmVtb3ZlTWFya2Rvd24iLCJUcmFuc2FjdGlvbiIsIlZpZXdQbHVnaW4iLCJQbHVnaW4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFvR0E7QUFDTyxTQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUU7QUFDN0QsSUFBSSxTQUFTLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEtBQUssWUFBWSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLFVBQVUsT0FBTyxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDaEgsSUFBSSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDL0QsUUFBUSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0FBQ25HLFFBQVEsU0FBUyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0FBQ3RHLFFBQVEsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFO0FBQ3RILFFBQVEsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENB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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdGZGLENBQUMsU0FBUyxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQzNCLEVBSVMsSUFBcUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtBQUM5RCxJQUFJLE1BQUEsQ0FBQSxPQUFjLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdEQsR0FBRyxNQUFNO0FBQ1QsTUFBTSxNQUFNLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzFELEdBQUc7QUFDSCxDQUFDLEVBQUUsT0FBTyxNQUFNLEtBQUssV0FBVyxHQUFHLE1BQU0sR0FBR0EsY0FBSSxFQUFFLFVBQVUsTUFBTSxFQUFFLFFBQVEsRUFBRTtBQUM5RSxFQUFFLElBQUksT0FBTyxHQUFHLFVBQXlCLENBQUM7QUFDMUMsRUFBRSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbkIsRUFBRSxJQUFJLGVBQWUsQ0FBQztBQUN0QixFQUFFLElBQUksV0FBVyxDQUFDO0FBQ2xCO0FBQ0EsRUFBRSxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFO0FBQzFDLElBQUksV0FBVyxHQUFHLGVBQWUsQ0FBQztBQUNsQyxJQUFJLGVBQWUsR0FBRyxjQUFjLElBQUksT0FBTyxDQUFDO0FBQ2hEO0FBQ0EsSUFBSSxLQUFLLEdBQUcsQ0FBQyxLQUFLLElBQUksV0FBVyxLQUFLLGVBQWUsSUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzlGO0FBQ0EsSUFBSSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFNBQVMsYUFBYSxFQUFFO0FBQ3RELE1BQU0sT0FBTyxlQUFlLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQztBQUMzRSxLQUFLLENBQUMsQ0FBQztBQUNQLEdBQUc7QUFDSDtBQUNBLEVBQUUsU0FBUyxXQUFXLENBQUMsT0FBTyxDQUFDO0FBQy9CLEtBQUssT0FBTyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNqSSxJQUFJO0FBQ0o7QUFDQSxFQUFFLE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUMsQ0FBQyxFQUFBOzs7OztBQ2hDRjtBQUNPLE1BQU0sV0FBVyxHQUFHO0FBQzNCLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDWixFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ1YsRUFBRSxVQUFVLEVBQUUsQ0FBQztBQUNmLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDVCxFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQ2QsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNkLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDWixFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ1YsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNWLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDVixFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQ1osRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNYLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDWCxFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQ2QsRUFBRSxVQUFVLEVBQUUsQ0FBQztBQUNmLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDWixFQUFFLElBQUksRUFBRSxDQUFDO0FBQ1QsRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUNiLEVBQUUsV0FBVyxFQUFFLENBQUM7QUFDaEIsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNWLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDVixFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ1YsRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNYLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDWCxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQ1osRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUNiLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDWixFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ1YsRUFBRSxVQUFVLEVBQUUsQ0FBQztBQUNmLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDWixFQUFFLFVBQVUsRUFBRSxDQUFDO0FBQ2YsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNkLEVBQUUsUUFBUSxFQUFFLENBQUM7QUFDYixFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQ2QsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNWLEVBQUUsT0FBTyxFQUFFLENB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
