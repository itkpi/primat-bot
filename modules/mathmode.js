const latex = require('latex')
const spawn = require('child_process').spawn

function sanitize(expr) {
  const sanitized = expr.replace(/([^\\](\\\\)*)(\$)/g, '$1')
  if(sanitized.charAt(0) === '$') {
    return sanitized.substr(1)
  }
  return sanitized
}

module.exports = function(expr, path) {
  const package_list = [ 'amsmath' ]
  const packages = []
  for(let i = 0; i < package_list.length; ++i) {
    const pkg = package_list[i]
    if(pkg instanceof Array) {
      packages.push('\\usepackage[' + pkg[1] + ']{' + pkg[0] + '}')
    } else {
      packages.push('\\usepackage{' + pkg + '}')
    }
  }
  
  const tex_stream = latex([
    '\\nonstopmode',
    '\\documentclass{minimal}',
    packages.join('\n'),
    '\\usepackage[active,tightpage]{preview}',
    '\\usepackage{transparent}',
    '\\begin{document}',
    '\\begin{preview} $',
    sanitize(expr),
    '$ \\end{preview}',
    '\\end{document}'
  ], {
    command:  'pdflatex',
    format:   'pdf'
  })
  
  const convert_path = 'convert'
  const convert = spawn(convert_path, [
    '-density', '300',
    '-quality', '100',
    'pdf:-',
    path
  ])
  
  const result = convert.stdout
  tex_stream.on('error', function(err) {
    result.emit('error', err)
    convert.kill()
  })
  tex_stream.pipe(convert.stdin)

  return result
}
