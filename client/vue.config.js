module.exports = {
  
  devServer: {
    proxy: {
      '/*.cgi' : {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      },
      '/*.cgi/*' : {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      },
      '/*/*.json' : {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      },
      '/*/*.jpg' : {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      },
      '/*/*.png' : {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      }
    }
  }
}