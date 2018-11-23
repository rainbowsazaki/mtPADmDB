module.exports = {
  
  devServer: {
    proxy: {
      '/*.cgi' : {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      },
      '/*.cgi/*' : {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      },
      '/monster*/*': {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      },
      '/listJson/*': {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      }
    }
  }
}