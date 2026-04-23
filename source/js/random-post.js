(() => {
  'use strict'

  window.randomPost = () => {
    const randomUrl = '/random.html'
    if (window.pjax && typeof window.pjax.loadUrl === 'function') {
      window.pjax.loadUrl(randomUrl)
      return
    }
    window.location.href = randomUrl
  }
})()
