FROM node:24-alpine AS frontend-build
WORKDIR /src/FrontEnd
COPY FrontEnd/package*.json ./
RUN npm ci
COPY FrontEnd/ ./
RUN npm run build -- --configuration prod

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api-build
WORKDIR /src
COPY BackEnd/BackEndApplication/APIServer/APIServer.csproj BackEnd/BackEndApplication/APIServer/
RUN dotnet restore BackEnd/BackEndApplication/APIServer/APIServer.csproj
COPY BackEnd/BackEndApplication/APIServer/ BackEnd/BackEndApplication/APIServer/
RUN dotnet publish BackEnd/BackEndApplication/APIServer/APIServer.csproj -c Release -o /app/publish --no-restore

FROM nginx:stable-alpine AS frontend
COPY --from=frontend-build /src/FrontEnd/dist/front-end/browser/ /usr/share/nginx/html/
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS api
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=api-build /app/publish/ ./
RUN mkdir -p /app/App_Data/keys /app/keys /app/uploads/images /app/uploads/images_clone /app/uploads/slider \
    && chown -R app:app /app/App_Data /app/keys /app/uploads
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "APIServer.dll"]
