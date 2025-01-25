using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace backend.Helpers
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Log the request details
            _logger.LogInformation("Request received: {method} {url}", context.Request.Method, context.Request.Path);

            // Intercept the response
            var originalResponseBodyStream = context.Response.Body;
            using (var responseBodyStream = new MemoryStream())
            {
                context.Response.Body = responseBodyStream;

                await _next(context); // Continue processing the request

                // Check if the response is a 400 BadRequest with validation errors
                if (context.Response.StatusCode == StatusCodes.Status400BadRequest && context.Response.ContentType?.Contains("application/problem+json") == true)
                {
                    responseBodyStream.Seek(0, SeekOrigin.Begin);
                    var responseBody = await new StreamReader(responseBodyStream).ReadToEndAsync();
                    responseBodyStream.Seek(0, SeekOrigin.Begin);

                    // Log the validation errors
                    _logger.LogError("Validation error: {details}", responseBody);
                }

                // Copy the intercepted response back to the original stream
                responseBodyStream.Seek(0, SeekOrigin.Begin);
                await responseBodyStream.CopyToAsync(originalResponseBodyStream);
            }

            // Log the response status code
            _logger.LogInformation("Response sent: {statusCode}", context.Response.StatusCode);
        }
    }
}
