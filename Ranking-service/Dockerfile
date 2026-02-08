# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY ["Ranking-service.csproj", "./"]
RUN dotnet restore "./Ranking-service.csproj"

# Copy all files and build
COPY . .
RUN dotnet publish "./Ranking-service.csproj" -c Release -o /app/publish

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Expose port and set environment variables
EXPOSE 5076
ENV ASPNETCORE_URLS=http://+:5076

ENTRYPOINT ["dotnet", "Ranking-service.dll"]
