import { languageConfigs } from '@/middleware/codeExecutor/languageConfigs';
import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';

// 通用的补全结果类型
interface CompletionItem {
  label: string;
  type: 'keyword' | 'function' | 'class' | 'variable' | 'constant' | 'operator' | 'type';
  info?: string;
  detail?: string;
}

// Python 补全
const pythonCompletions = {
  keywords: [
    "and", "as", "assert", "async", "await", "break", "class", "continue", 
    "def", "del", "elif", "else", "except", "finally", "for", "from", "global",
    "if", "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass",
    "raise", "return", "try", "while", "with", "yield"
  ],
  builtins: [
    "print", "len", "range", "str", "int", "float", "list", "dict", "set",
    "tuple", "bool", "input", "open", "type", "sum", "max", "min", "abs",
    "all", "any", "enumerate", "filter", "map", "zip", "sorted"
  ]
};

// Java 补全
const javaCompletions = {
  keywords: [
    "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char",
    "class", "const", "continue", "default", "do", "double", "else", "enum",
    "extends", "final", "finally", "float", "for", "if", "implements", "import",
    "instanceof", "int", "interface", "long", "native", "new", "package",
    "private", "protected", "public", "return", "short", "static", "strictfp",
    "super", "switch", "synchronized", "this", "throw", "throws", "transient",
    "try", "void", "volatile", "while"
  ],
  builtins: [
    "System.out.println", "String", "Integer", "Boolean", "Double", "Float",
    "List", "ArrayList", "Map", "HashMap", "Set", "HashSet"
  ]
};

// C/C++ 补全
const cppCompletions = {
  keywords: [
    "auto", "break", "case", "char", "const", "continue", "default", "do",
    "double", "else", "enum", "extern", "float", "for", "goto", "if", "int",
    "long", "register", "return", "short", "signed", "sizeof", "static",
    "struct", "switch", "typedef", "union", "unsigned", "void", "volatile",
    "while", "class", "namespace", "template", "try", "catch", "new", "delete",
    "this", "operator", "private", "protected", "public", "virtual", "friend"
  ],
  builtins: [
    "std::cout", "std::cin", "std::endl", "std::string", "std::vector",
    "std::map", "std::set", "std::pair", "std::make_pair", "printf", "scanf"
  ]
};

// Rust 补全
const rustCompletions = {
  keywords: [
    "as", "break", "const", "continue", "crate", "else", "enum", "extern",
    "false", "fn", "for", "if", "impl", "in", "let", "loop", "match", "mod",
    "move", "mut", "pub", "ref", "return", "self", "Self", "static", "struct",
    "super", "trait", "true", "type", "unsafe", "use", "where", "while"
  ],
  builtins: [
    "println!", "format!", "vec!", "String::from", "Option", "Result",
    "Vec::new", "Some", "None", "Ok", "Err"
  ]
};

// JavaScript 补全
const javascriptCompletions = {
    keywords: [
      "break", "case", "catch", "class", "const", "continue", "debugger", 
      "default", "delete", "do", "else", "export", "extends", "finally", 
      "for", "function", "if", "import", "in", "instanceof", "new", "return", 
      "super", "switch", "this", "throw", "try", "typeof", "var", "void", 
      "while", "with", "yield", "async", "await", "let"
    ],
    builtins: [
      "console.log", "console.error", "console.warn", "console.info",
      "Array", "Object", "String", "Number", "Boolean", "Date", "Math",
      "JSON.parse", "JSON.stringify", "Promise", "setTimeout", "setInterval",
      "Map", "Set", "WeakMap", "WeakSet", "RegExp", "Error"
    ],
    methods: [
      "forEach", "map", "filter", "reduce", "find", "findIndex", "includes",
      "push", "pop", "shift", "unshift", "slice", "splice", "join", "split",
      "toString", "valueOf", "charAt", "concat", "indexOf", "lastIndexOf",
      "match", "replace", "search", "trim"
    ]
  };
  
  // TypeScript 额外补全（继承 JavaScript 补全）
const typescriptCompletions = {
    keywords: [
      ...javascriptCompletions.keywords,
      "interface", "namespace", "type", "implements", "declare",
      "abstract", "as", "is", "keyof", "readonly", "private", "protected",
      "public", "static", "enum", "unknown", "never", "any"
    ],
    types: [
      "string", "number", "boolean", "null", "undefined", "void", "object",
      "symbol", "bigint", "unknown", "never", "any", "Array<T>", "Promise<T>",
      "Partial<T>", "Readonly<T>", "Record<K,T>", "Pick<T,K>", "Omit<T,K>",
      "Exclude<T,U>", "Extract<T,U>", "NonNullable<T>", "Parameters<T>",
      "ReturnType<T>", "Required<T>", "ThisType<T>"
    ]
};
  
  // C# 补全
const csharpCompletions = {
    keywords: [
      "abstract", "as", "base", "bool", "break", "byte", "case", "catch",
      "char", "checked", "class", "const", "continue", "decimal", "default",
      "delegate", "do", "double", "else", "enum", "event", "explicit",
      "extern", "false", "finally", "fixed", "float", "for", "foreach",
      "goto", "if", "implicit", "in", "int", "interface", "internal", "is",
      "lock", "long", "namespace", "new", "null", "object", "operator",
      "out", "override", "params", "private", "protected", "public",
      "readonly", "ref", "return", "sbyte", "sealed", "short", "sizeof",
      "stackalloc", "static", "string", "struct", "switch", "this", "throw",
      "true", "try", "typeof", "uint", "ulong", "unchecked", "unsafe",
      "ushort", "using", "virtual", "void", "volatile", "while"
    ],
    builtins: [
      "Console.WriteLine", "Console.ReadLine", "String.Format", "Convert.To",
      "List<T>", "Dictionary<K,V>", "IEnumerable<T>", "Task", "Task<T>",
      "async", "await", "var", "dynamic", "Action", "Func", "Tuple",
      "Debug.WriteLine", "StringBuilder", "DateTime", "TimeSpan", "Guid"
    ]
};
  
  // Ruby 补全
const rubyCompletions = {
    keywords: [
      "alias", "and", "begin", "break", "case", "class", "def", "defined?",
      "do", "else", "elsif", "end", "ensure", "false", "for", "if", "in",
      "module", "next", "nil", "not", "or", "redo", "rescue", "retry",
      "return", "self", "super", "then", "true", "undef", "unless", "until",
      "when", "while", "yield"
    ],
    builtins: [
      "puts", "print", "gets", "attr_accessor", "attr_reader", "attr_writer",
      "require", "include", "extend", "raise", "lambda", "proc", "new",
      "initialize", "to_s", "to_i", "to_a", "to_h", "map", "each", "select",
      "reject", "reduce", "inject", "collect", "detect", "find"
    ]
};
  
  // PHP 补全
const phpCompletions = {
    keywords: [
      "abstract", "and", "array", "as", "break", "callable", "case", "catch",
      "class", "clone", "const", "continue", "declare", "default", "die", "do",
      "echo", "else", "elseif", "empty", "enddeclare", "endfor", "endforeach",
      "endif", "endswitch", "endwhile", "eval", "exit", "extends", "final",
      "finally", "fn", "for", "foreach", "function", "global", "goto", "if",
      "implements", "include", "include_once", "instanceof", "insteadof",
      "interface", "isset", "list", "match", "namespace", "new", "or",
      "print", "private", "protected", "public", "require", "require_once",
      "return", "static", "switch", "throw", "trait", "try", "unset", "use",
      "var", "while", "xor", "yield"
    ],
    builtins: [
      "array_map", "array_filter", "array_reduce", "array_merge", "count",
      "strlen", "str_replace", "implode", "explode", "json_encode",
      "json_decode", "file_get_contents", "file_put_contents", "mysqli_connect",
      "PDO", "date", "time", "strtotime", "preg_match", "preg_replace"
    ]
};
  
  // Swift 补全
const swiftCompletions = {
    keywords: [
      "associatedtype", "class", "deinit", "enum", "extension", "fileprivate",
      "func", "import", "init", "inout", "internal", "let", "open", "operator",
      "private", "protocol", "public", "rethrows", "static", "struct",
      "subscript", "typealias", "var", "break", "case", "continue", "default",
      "defer", "do", "else", "fallthrough", "for", "guard", "if", "in", "repeat",
      "return", "switch", "where", "while", "as", "Any", "catch", "false",
      "is", "nil", "super", "self", "Self", "throw", "throws", "true", "try"
    ],
    builtins: [
      "print", "String", "Int", "Double", "Bool", "Array", "Dictionary",
      "Optional", "Result", "Set", "Range", "max", "min", "sorted", "filter",
      "map", "reduce", "compactMap", "flatMap", "zip", "enumerated"
    ]
};
  
  // Scala 补全
const scalaCompletions = {
    keywords: [
      "abstract", "case", "catch", "class", "def", "do", "else", "extends",
      "false", "final", "finally", "for", "forSome", "if", "implicit",
      "import", "lazy", "match", "new", "null", "object", "override",
      "package", "private", "protected", "return", "sealed", "super", "this",
      "throw", "trait", "try", "true", "type", "val", "var", "while", "with",
      "yield"
    ],
    builtins: [
      "List", "Set", "Map", "Vector", "Stream", "Option", "Some", "None",
      "Either", "Left", "Right", "Future", "Promise", "Tuple", "println",
      "assert", "require", "synchronized", "wait", "notify", "notifyAll"
    ],
    collections: [
      "map", "flatMap", "filter", "fold", "foldLeft", "foldRight", "reduce",
      "collect", "head", "tail", "take", "drop", "zip", "exists", "forall",
      "find", "contains", "mkString", "toList", "toSet", "toMap"
    ]
};

export function getLanguageCompletions(language: string) {
  const completions: { [key: string]: (context: CompletionContext) => CompletionResult | null } = {
    python3: (context) => {
      const word = context.matchBefore(/\w*/);
      if (!word) return null;
      
      return {
        from: word.from,
        options: [
          ...pythonCompletions.keywords.map(w => ({
            label: w,
            type: "keyword",
            info: "Python keyword"
          })),
          ...pythonCompletions.builtins.map(w => ({
            label: w,
            type: "function",
            info: "Python built-in function"
          }))
        ]
      };
    },

    java: (context) => {
      const word = context.matchBefore(/\w*/);
      if (!word) return null;
      
      return {
        from: word.from,
        options: [
          ...javaCompletions.keywords.map(w => ({
            label: w,
            type: "keyword",
            info: "Java keyword"
          })),
          ...javaCompletions.builtins.map(w => ({
            label: w,
            type: "class",
            info: "Java built-in class/method"
          }))
        ]
      };
    },

    cpp: (context) => {
      const word = context.matchBefore(/\w*/);
      if (!word) return null;
      
      return {
        from: word.from,
        options: [
          ...cppCompletions.keywords.map(w => ({
            label: w,
            type: "keyword",
            info: "C++ keyword"
          })),
          ...cppCompletions.builtins.map(w => ({
            label: w,
            type: "function",
            info: "C++ standard library"
          }))
        ]
      };
    },

    rust: (context) => {
      const word = context.matchBefore(/\w*/);
      if (!word) return null;
      
      return {
        from: word.from,
        options: [
          ...rustCompletions.keywords.map(w => ({
            label: w,
            type: "keyword",
            info: "Rust keyword"
          })),
          ...rustCompletions.builtins.map(w => ({
            label: w,
            type: "function",
            info: "Rust built-in macro/type"
          }))
        ]
      };
    },
    javascript: (context) => {
        const word = context.matchBefore(/\w*/);
        if (!word) return null;
        
        return {
          from: word.from,
          options: [
            ...javascriptCompletions.keywords.map(w => ({
              label: w,
              type: "keyword",
              info: "JavaScript keyword"
            })),
            ...javascriptCompletions.builtins.map(w => ({
              label: w,
              type: "function",
              info: "JavaScript built-in"
            })),
            ...javascriptCompletions.methods.map(w => ({
              label: w,
              type: "method",
              info: "Common JavaScript method"
            }))
          ]
        };
      },
      typescript: (context) => {
        const word = context.matchBefore(/\w*/);
        if (!word) return null;
        
        return {
          from: word.from,
          options: [
            ...typescriptCompletions.keywords.map(w => ({
              label: w,
              type: "keyword",
              info: "TypeScript keyword"
            })),
            ...javascriptCompletions.builtins.map(w => ({
              label: w,
              type: "function",
              info: "TypeScript built-in"
            })),
            ...typescriptCompletions.types.map(w => ({
              label: w,
              type: "type",
              info: "TypeScript type"
            }))
          ]
        };
      },
      csharp: (context) => {
        const word = context.matchBefore(/\w*/);
        if (!word) return null;
        
        return {
          from: word.from,
          options: [
            ...csharpCompletions.keywords.map(w => ({
              label: w,
              type: "keyword",
              info: "C# keyword"
            })),
            ...csharpCompletions.builtins.map(w => ({
              label: w,
              type: "function",
              info: "C# built-in"
            }))
          ]
        };
      },
  
      ruby: (context) => {
        const word = context.matchBefore(/\w*/);
        if (!word) return null;
        
        return {
          from: word.from,
          options: [
            ...rubyCompletions.keywords.map(w => ({
              label: w,
              type: "keyword",
              info: "Ruby keyword"
            })),
            ...rubyCompletions.builtins.map(w => ({
              label: w,
              type: "function",
              info: "Ruby built-in"
            }))
          ]
        };
      },
      php: (context) => {
        const word = context.matchBefore(/\w*/);
        if (!word) return null;
        
        return {
          from: word.from,
          options: [
            ...phpCompletions.keywords.map(w => ({
              label: w,
              type: "keyword",
              info: "PHP keyword"
            })),
            ...phpCompletions.builtins.map(w => ({
              label: w,
              type: "function",
              info: "PHP built-in"
            }))
          ]
        };
      },
  
      swift: (context) => {
        const word = context.matchBefore(/\w*/);
        if (!word) return null;
        
        return {
          from: word.from,
          options: [
            ...swiftCompletions.keywords.map(w => ({
              label: w,
              type: "keyword",
              info: "Swift keyword"
            })),
            ...swiftCompletions.builtins.map(w => ({
              label: w,
              type: "function",
              info: "Swift built-in"
            }))
          ]
        };
      },
      scala: (context) => {
        const word = context.matchBefore(/\w*/);
        if (!word) return null;
        
        return {
          from: word.from,
          options: [
            ...scalaCompletions.keywords.map(w => ({
              label: w,
              type: "keyword",
              info: "Scala keyword"
            })),
            ...scalaCompletions.builtins.map(w => ({
              label: w,
              type: "class",
              info: "Scala built-in type/object"
            })),
            ...scalaCompletions.collections.map(w => ({
              label: w,
              type: "method",
              info: "Scala collection method"
            }))
          ]
        };
      }
  };

  return completions[language] || null;
}

export default languageConfigs;