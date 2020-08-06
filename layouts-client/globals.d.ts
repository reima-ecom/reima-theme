interface Window {
  experiment?: string
  site: {
    algolia?: {
      indexname: string
      appid: string
      apikey: string
    }
    shopify: {
      store: string
      token: string
    }
  }
}