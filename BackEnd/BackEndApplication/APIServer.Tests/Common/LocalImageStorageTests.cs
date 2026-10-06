using APIServer.Infrastructure;
using Xunit;

namespace APIServer.Tests.Common;

public sealed class LocalImageStorageTests : IDisposable
{
    private readonly string root = Path.Combine(Path.GetTempPath(), "jms-storage-test-" + Guid.NewGuid());

    [Theory]
    [InlineData("/images/../../secret.txt")]
    [InlineData("/images/..")]
    [InlineData("https://example.test/images/photo.png")]
    [InlineData("/images/photo.png?secret")]
    [InlineData("/keys/key.xml")]
    [InlineData("C:\\images\\photo.png")]
    public void RejectsPathsOutsidePublicImageFolders(string path)
    {
        Assert.Null(new LocalImageStorage(root).Resolve(path));
    }

    [Fact]
    public void SnapshotSurvivesOriginalReplacementAndServiceRestart()
    {
        var storage = new LocalImageStorage(root);
        File.WriteAllText(storage.Resolve("/images/avatar.png")!, "original");
        var snapshot = storage.Snapshot("\\images\\avatar.png");
        storage.Delete("/images/avatar.png");
        var restarted = new LocalImageStorage(root);
        Assert.Equal("original", File.ReadAllText(restarted.Resolve(snapshot)!));
        Assert.Equal("https://example.test/photo.png", restarted.Snapshot("https://example.test/photo.png"));
    }

    public void Dispose() => Directory.Delete(root, recursive: true);
}
