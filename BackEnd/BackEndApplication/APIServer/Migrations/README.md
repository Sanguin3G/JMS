# Migrations

`Migrations/Sqlite` contains the active EF Core migration baseline for this fork.

The C# migration files in this directory's root are the original SQL Server migration history. They are retained as historical reference but excluded from compilation by `APIServer.csproj`; SQLite cannot safely replay them. Do not add migrations beside them.
