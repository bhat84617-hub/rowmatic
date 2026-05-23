import * as XLSX from 'xlsx'

export async function extractFileData(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const readAs = (m) => new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = () => rej(new Error('Read failed'))
    m === 'buf' ? r.readAsArrayBuffer(file) : r.readAsText(file)
  })

  if (['xlsx', 'xls'].includes(ext)) {
    const buf = await readAs('buf')
    const wb = XLSX.read(buf, { type: 'array', cellDates: true })
    let text = ''
    wb.SheetNames.forEach(n => { text += `\n=== Sheet: ${n} ===\n` + XLSX.utils.sheet_to_csv(wb.Sheets[n]) })
    return { text, type: 'excel' }
  }
  if (ext === 'csv') return { text: await readAs('text'), type: 'csv' }
  if (['html', 'htm'].includes(ext)) {
    const text = await readAs('text')
    const doc = new DOMParser().parseFromString(text, 'text/html')
    let out = ''
    doc.querySelectorAll('table').forEach((t, i) => {
      out += `\n=== Table ${i + 1} ===\n`
      t.querySelectorAll('tr').forEach(row => {
        out += [...row.querySelectorAll('td,th')].map(c => c.innerText.trim()).join(',') + '\n'
      })
    })
    return { text: out || doc.body.innerText, type: 'html' }
  }
  if (ext === 'json') return { text: await readAs('text'), type: 'json' }
  return { text: await readAs('text'), type: 'text' }
}

export function buildWorkbook(sheets) {
  const wb = XLSX.utils.book_new()
  sheets.forEach(sheet => {
    const ws = XLSX.utils.aoa_to_sheet(sheet.data)
    const cols = sheet.data[0]?.map((_, i) => ({ wch: Math.max(...sheet.data.map(r => String(r[i] ?? '').length), 10) }))
    if (cols) ws['!cols'] = cols
    XLSX.utils.book_append_sheet(wb, ws, (sheet.name || 'Sheet1').substring(0, 31))
  })
  return wb
}

export function downloadWb(wb, name, fmt = 'xlsx') {
  if (fmt === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]])
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: name + '.csv' })
    a.click()
  } else {
    XLSX.writeFile(wb, name + '.xlsx')
  }
}
