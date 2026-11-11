using System;

interface INamed { string Name { get; } }

// Compare the attribute and the type name.
[Obsolete("Example")]
class User : INamed {
    public string Name { get; } = "Bea";
    public int Count => 42;
}
