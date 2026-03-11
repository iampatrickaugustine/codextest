param(
  [int]$Port = 8123,
  [string]$Root = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.js' = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png' = 'image/png'
  '.jpg' = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif' = 'image/gif'
  '.svg' = 'image/svg+xml'
  '.ico' = 'image/x-icon'
  '.txt' = 'text/plain; charset=utf-8'
}

$rootPath = [System.IO.Path]::GetFullPath($Root)
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse('127.0.0.1'), $Port)
$listener.Start()

Write-Output "Serving $rootPath at http://127.0.0.1:$Port/"

function Send-Response {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [byte[]]$Body,
    [string]$ContentType = 'text/plain; charset=utf-8'
  )

  $header = "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  $Stream.Write($Body, 0, $Body.Length)
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()

    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 4096, $true)
      $requestLine = $reader.ReadLine()

      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes('Bad Request')
        Send-Response -Stream $stream -StatusCode 400 -StatusText 'Bad Request' -Body $body
        continue
      }

      while ($reader.ReadLine()) {
        if ($null -eq $reader) { break }
      }

      $parts = $requestLine.Split(' ')
      if ($parts.Length -lt 2) {
        $body = [System.Text.Encoding]::UTF8.GetBytes('Bad Request')
        Send-Response -Stream $stream -StatusCode 400 -StatusText 'Bad Request' -Body $body
        continue
      }

      $rawPath = $parts[1]
      $pathOnly = $rawPath.Split('?')[0]
      $requestPath = [Uri]::UnescapeDataString($pathOnly.TrimStart('/'))

      if ([string]::IsNullOrWhiteSpace($requestPath)) {
        $requestPath = 'index.html'
      }

      $requestPath = $requestPath -replace '/', '\\'
      $safePath = [System.IO.Path]::GetFullPath((Join-Path $rootPath $requestPath))

      if (-not $safePath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
        Send-Response -Stream $stream -StatusCode 403 -StatusText 'Forbidden' -Body $body
        continue
      }

      if (-not (Test-Path $safePath -PathType Leaf)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
        Send-Response -Stream $stream -StatusCode 404 -StatusText 'Not Found' -Body $body
        continue
      }

      $extension = [System.IO.Path]::GetExtension($safePath).ToLowerInvariant()
      $contentType = $mimeTypes[$extension]
      if (-not $contentType) {
        $contentType = 'application/octet-stream'
      }

      $bytes = [System.IO.File]::ReadAllBytes($safePath)
      Send-Response -Stream $stream -StatusCode 200 -StatusText 'OK' -Body $bytes -ContentType $contentType
    }
    finally {
      if ($reader) {
        $reader.Dispose()
      }
      if ($stream) {
        $stream.Dispose()
      }
      $client.Close()
    }
  }
}
finally {
  $listener.Stop()
}
