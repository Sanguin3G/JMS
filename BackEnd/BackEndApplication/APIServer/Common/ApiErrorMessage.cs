namespace APIServer.Common;

public static class ApiErrorMessage
{
    public static string For(Exception exception, HttpContext context) =>
        context.RequestServices.GetService<IHostEnvironment>()?.IsDevelopment() == true
            ? exception.Message
            : "Không thể thực hiện yêu cầu. Kiểm tra thông tin và thử lại.";
}
