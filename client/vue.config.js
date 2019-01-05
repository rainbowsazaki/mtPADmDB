module.exports = {
  
  devServer: {
    proxy: {
      '/*.cgi': {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      },
      '/*.cgi/*': {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      },
      '/monsterIcons*/*': {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      },
      '/monsterImages*/*': {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      },
      '/monsterJson/*': {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      },
      '/listJson/*': {
        target: 'http://localhost/~rainbowsazaki/mtPADmDB/'
      }
    }
  }
};
