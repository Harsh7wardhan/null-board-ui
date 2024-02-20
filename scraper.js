async function getData(){
    const resp = await fetch("https://loopback.io/")
    const text = await resp.text();
    console.log(text)
}

getData()