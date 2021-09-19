module.exports = {
  networks: {
    hardhat: {
      mining: {
        auto: false,
        interval: 10000,
      },
      hardfork: "london"
    },
  },
  analytics: { enabled: false },
}
