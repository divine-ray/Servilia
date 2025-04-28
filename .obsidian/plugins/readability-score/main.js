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
  options.throwError = options.hasOwnProperty('throwError') ? options.throwError : false;

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
      .replace(/^(\n)?\s{0,3}>\s?/gm, '$1')
      // .replace(/(^|\n)\s{0,3}>\s?/g, '\n\n')
      // Remove reference-style links?
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
      // Remove atx-style headers
      .replace(/^(\n)?\s{0,}#{1,6}\s*( (.+))? +#+$|^(\n)?\s{0,}#{1,6}\s*( (.+))?$/gm, '$1$3$4$6')
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
    if (options.throwError) throw e;

    console.error("remove-markdown encountered error: %s", e);
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
  const values = normalizeStrings(String(value))
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

const MAX_PROCESSABLE_LENGTH = 10 * 1024 * 1024; // 10MB limit
class StatusBar {
    constructor(statusBarEl) {
        this.statusBarEl = statusBarEl;
        this.debounceStatusBarUpdate = obsidian.debounce((text) => this.updateStatusBar(text), 50, // Increased debounce time for larger texts
        false);
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
            // Only check for extreme cases that could crash the browser
            if (text.length > MAX_PROCESSABLE_LENGTH) {
                this.displayText('r9y: text exceeds 10MB limit');
                return;
            }
            try {
                // Show processing indicator for large texts
                if (text.length > 1000000) { // 1MB
                    this.displayText('r9y: processing large text...');
                }
                const plainText = removeMarkdown(text, {
                    stripListLeaders: true,
                    listUnicodeChar: '',
                    gfm: true,
                    useImgAltText: true
                });
                const syllables = syllable(plainText);
                const words = getWordCount(plainText);
                const sentences = getSentenceCount(plainText);
                // Adjust limits for much larger texts
                if (words > 500000 || sentences > 50000) { // ~1000 pages of text
                    this.displayText('r9y: text exceeds processing limits (>500k words)');
                    return;
                }
                const fleschCount = flesch({ sentence: sentences, word: words, syllable: syllables });
                const output = formatFRE(fleschCount);
                this.displayText(output);
            }
            catch (error) {
                console.error('Error processing text:', error);
                this.displayText('r9y: error processing text');
            }
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
        try {
            if ((tr.isUserEvent("select") || userEventTypeUndefined) &&
                tr.newSelection.ranges[0].from !== tr.newSelection.ranges[0].to) {
                // Handle selected text
                const selection = tr.newSelection.main;
                const text = tr.newDoc.sliceString(selection.from, selection.to);
                this.plugin.statusBar.debounceStatusBarUpdate(text);
            }
            else if (tr.isUserEvent("input") ||
                tr.isUserEvent("delete") ||
                tr.isUserEvent("move") ||
                tr.isUserEvent("undo") ||
                tr.isUserEvent("redo") ||
                tr.isUserEvent("select")) {
                // Handle full document
                const text = tr.newDoc.toString();
                this.plugin.statusBar.debounceStatusBarUpdate(text);
            }
        }
        catch (error) {
            console.error('Error processing editor update:', error);
            this.plugin.statusBar.displayText('r9y: error processing text');
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


/* nosourcemap */