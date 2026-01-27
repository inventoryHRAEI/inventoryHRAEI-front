(async () => {
  try {
    let acc = 0
    let page = 0
    const pageSize = 1000
    while (true) {
      const skip = page * pageSize
      const url = `http://127.0.0.1:3002/api/ops/historial-mantenimientos?lite=1&limit=${pageSize}&skip=${skip}&withTotal=1`
      console.log('Requesting', url)
      const res = await fetch(url).catch(e => { console.error('fetch error', e); return null })
      if (!res) break
      const json = await res.json().catch(() => null)
      if (!json) break
      const count = Array.isArray(json.data) ? json.data.length : (Array.isArray(json) ? json.length : 0)
      acc += count
      const total = json.total
      console.log(`Got page ${page}: items=${count} totalReported=${total} accumulated=${acc}`)
      if (typeof total === 'number' && acc >= total) break
      if (count === 0) break
      page++
      await new Promise(r => setTimeout(r, 50))
    }
    console.log('Finished: accumulated', acc)
  } catch (e) {
    console.error('Test failed', e)
  }
})()
