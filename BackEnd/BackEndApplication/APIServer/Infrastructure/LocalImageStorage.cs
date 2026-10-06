namespace APIServer.Infrastructure;

/// <summary>Local public images only; database values never select arbitrary filesystem paths.</summary>
public sealed class LocalImageStorage
{
    private static readonly string[] Folders = ["images", "images_clone", "slider"];
    public string Root { get; }

    public LocalImageStorage(IConfiguration configuration, IWebHostEnvironment environment)
        : this(Path.GetFullPath(configuration["Storage:UploadRoot"] ?? "wwwroot", environment.ContentRootPath)) { }

    public LocalImageStorage(string root)
    {
        Root = Path.GetFullPath(root);
        foreach (var folder in Folders) Directory.CreateDirectory(Path.Combine(Root, folder));
    }

    public string? Resolve(string? publicPath)
    {
        if (string.IsNullOrWhiteSpace(publicPath)) return null;
        var segments = publicPath.Replace('\\', '/').TrimStart('/').Split('/');
        if (segments.Length != 2 || !Folders.Contains(segments[0]) ||
            string.IsNullOrWhiteSpace(segments[1]) || segments[1] is "." or ".." ||
            segments[1].IndexOfAny([':', '?', '#', '\0']) >= 0 ||
            segments[1].IndexOfAny(Path.GetInvalidFileNameChars()) >= 0) return null;
        return Path.Combine(Root, segments[0], segments[1]);
    }

    public void Delete(string? publicPath)
    {
        var path = Resolve(publicPath);
        if (path != null && File.Exists(path)) File.Delete(path);
    }

    public string? Snapshot(string? publicPath)
    {
        var source = Resolve(publicPath);
        if (source == null || !File.Exists(source)) return publicPath;
        var destination = $"/images_clone/{Guid.NewGuid():N}{Path.GetExtension(source)}";
        File.Copy(source, Resolve(destination)!, overwrite: false);
        return destination;
    }
}
