import { useState, useRef } from 'react'

export default function App() {
  const [photoUrl, setPhotoUrl] = useState(null)
  const [photoName, setPhotoName] = useState('')
  const [fullName, setFullName] = useState('')
  
  // Locked Soft Rose & Cream Card Theme
  const CARD_THEME = {
    bgGradStart: '#fff1f2',
    bgGradEnd: '#ffe4e6',
    textColor: '#881337',
    dateColor: '#9f1239',
    borderColor: '#f43f5e',
    cssClass: 'bg-gradient-to-b from-[#fff1f2] to-[#ffe4e6] text-[#881337]'
  }

  // Photo positioning & scaling state
  const [fitMode, setFitMode] = useState('contain')
  const [photoZoom, setPhotoZoom] = useState(100)
  const [photoOffsetX, setPhotoOffsetX] = useState(0)
  const [photoOffsetY, setPhotoOffsetY] = useState(0)

  const [validationState, setValidationState] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)

  // Default sample photo
  const DEFAULT_SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop'
  const activePhotoUrl = photoUrl || DEFAULT_SAMPLE_PHOTO

  // Template Details for THE EAGLES ASSEMBLY - WOMEN CONVENTION 2026
  const CHURCH_NAME = 'THE EAGLES ASSEMBLY'
  const CHURCH_LOCATION = 'Osongoma, Uyo'
  const EVENT_TITLE = 'WOMEN CONVENTION 2026'
  const EVENT_DATES = '23RD - 27TH SEPT 2026'
  
  const PROGRAM_1_TITLE = 'WORD & PRAYER FESTIVAL'
  const PROGRAM_1_TIME = 'WED - FRI 5PM DAILY'
  const PROGRAM_2_TITLE = 'WOMEN TIMEOUT & VISITATION'
  const PROGRAM_2_TIME = 'SATURDAY 7:00AM'
  const PROGRAM_3_TITLE = 'THANKSGIVING CELEBRATION'
  const PROGRAM_3_TIME = 'SUNDAY 8:00AM'

  const TICKET_TAG_TOP = 'EAGLES'
  const TICKET_TAG_YEAR = '2026'
  const TICKET_CONFIRM = 'LIVE STREAM'
  const FOOTER_POWERED = 'The Eagles Assembly, Osongoma, Uyo'
  const SOCIAL_HANDLE = 'FB/YT: @Theeaglesassemblyuyo'

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type.toLowerCase())) {
      setValidationState({
        type: 'error',
        text: 'Invalid file format. Please upload a JPG, JPEG, PNG, or WebP image.'
      })
      if (e.target) e.target.value = ''
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      setValidationState({
        type: 'error',
        text: 'Image size is too large. Please select an image under 25MB.'
      })
      if (e.target) e.target.value = ''
      return
    }

    if (photoUrl) {
      URL.revokeObjectURL(photoUrl)
    }

    const url = URL.createObjectURL(file)
    setPhotoUrl(url)
    setPhotoName(file.name)
    
    setFitMode('contain')
    setPhotoZoom(100)
    setPhotoOffsetX(0)
    setPhotoOffsetY(0)

    setValidationState({
      type: 'success',
      text: 'Photo uploaded! Auto-fit applied.'
    })
  }

  const handleRemovePhoto = () => {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl)
    }
    setPhotoUrl(null)
    setPhotoName('')
    setFitMode('contain')
    setPhotoZoom(100)
    setPhotoOffsetX(0)
    setPhotoOffsetY(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setValidationState(null)
  }

  // Draw Photo on Canvas with Automatic Fit (Contain / Cover) & Offsets
  const drawImageCover = (
    ctx, 
    img, 
    x, 
    y, 
    width, 
    height, 
    radius = 0, 
    mode = 'contain',
    scalePercent = 100, 
    offsetXPercent = 0, 
    offsetYPercent = 0
  ) => {
    ctx.save()
    
    if (radius > 0) {
      ctx.beginPath()
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, radius)
      } else {
        ctx.rect(x, y, width, height)
      }
      ctx.clip()
    }

    if (mode === 'contain') {
      ctx.fillStyle = '#111827'
      ctx.fillRect(x, y, width, height)
    }

    const imgRatio = img.naturalWidth / img.naturalHeight
    const targetRatio = width / height
    
    let drawW, drawH, drawX, drawY

    if (mode === 'contain') {
      if (imgRatio > targetRatio) {
        drawW = width
        drawH = width / imgRatio
      } else {
        drawH = height
        drawW = height * imgRatio
      }
      drawX = x + (width - drawW) / 2
      drawY = y + (height - drawH) / 2
    } else {
      if (imgRatio > targetRatio) {
        drawH = height
        drawW = drawH * imgRatio
      } else {
        drawW = width
        drawH = drawW / imgRatio
      }
      drawX = x + (width - drawW) / 2
      drawY = y + (height - drawH) / 2
    }

    const scale = scalePercent / 100
    const finalW = drawW * scale
    const finalH = drawH * scale

    const panX = (offsetXPercent / 100) * width
    const panY = (offsetYPercent / 100) * height

    const finalX = drawX + (drawW - finalW) / 2 + panX
    const finalY = drawY + (drawH - finalH) / 2 + panY

    ctx.drawImage(img, finalX, finalY, finalW, finalH)
    ctx.restore()
  }

  const drawRoundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath()
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r)
    } else {
      ctx.rect(x, y, w, h)
    }
  }

  // Eagle Crest Logo Drawing
  const drawEagleCrest = (ctx, cx, cy, radius) => {
    ctx.save()
    
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.strokeStyle = '#ffd700'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, radius * 0.85, 0, Math.PI * 2)
    ctx.fillStyle = '#8b0032'
    ctx.fill()

    ctx.fillStyle = '#ffd700'
    ctx.beginPath()
    ctx.moveTo(cx - 12, cy + 4)
    ctx.lineTo(cx, cy - 14)
    ctx.lineTo(cx + 12, cy + 4)
    ctx.lineTo(cx + 5, cy + 2)
    ctx.lineTo(cx, cy - 4)
    ctx.lineTo(cx - 5, cy + 2)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(cx, cy - 2, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  const drawTicketShape = (ctx, x, y, w, h, notchR = 12) => {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + w, y)
    ctx.lineTo(x + w, y + h / 2 - notchR)
    ctx.arc(x + w, y + h / 2, notchR, -Math.PI / 2, Math.PI / 2, true)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
    ctx.lineTo(x, y + h / 2 + notchR)
    ctx.arc(x, y + h / 2, notchR, Math.PI / 2, -Math.PI / 2, true)
    ctx.lineTo(x, y)
    ctx.closePath()
  }

  // Generate & Download Canvas Image (1080 x 1080 px Square Frame)
  const generateAndDownloadFrame = async (e) => {
    if (e) e.preventDefault()

    if (!photoUrl && !fullName.trim()) {
      setValidationState({
        type: 'error',
        text: 'Please upload your photo and enter your name to download your frame.'
      })
      return
    }

    if (!photoUrl) {
      setValidationState({
        type: 'error',
        text: 'Please upload your photo before generating the frame.'
      })
      return
    }

    setIsGenerating(true)
    setValidationState(null)

    try {
      const CANVAS_SIZE = 1080
      const canvas = canvasRef.current || document.createElement('canvas')
      canvas.width = CANVAS_SIZE
      canvas.height = CANVAS_SIZE
      const ctx = canvas.getContext('2d')

      const photoImg = new Image()
      photoImg.crossOrigin = 'anonymous'

      await new Promise((resolve, reject) => {
        photoImg.onload = resolve
        photoImg.onerror = () => reject(new Error('Failed to load image.'))
        photoImg.src = activePhotoUrl
      })

      // 1. Rich Crimson Red Glow Gradient Background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE)
      bgGradient.addColorStop(0, '#59001b')
      bgGradient.addColorStop(0.35, '#8b0032')
      bgGradient.addColorStop(0.7, '#a8003b')
      bgGradient.addColorStop(1, '#420013')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      const radialGlow = ctx.createRadialGradient(
        CANVAS_SIZE / 2, 520, 60,
        CANVAS_SIZE / 2, 520, 580
      )
      radialGlow.addColorStop(0, 'rgba(255, 215, 0, 0.28)')
      radialGlow.addColorStop(0.5, 'rgba(216, 27, 96, 0.35)')
      radialGlow.addColorStop(1, 'rgba(50, 0, 15, 0)')
      ctx.fillStyle = radialGlow
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      // 2. Top Left Header
      drawEagleCrest(ctx, 55, 58, 26)

      ctx.textAlign = 'left'
      ctx.fillStyle = '#ffffff'
      ctx.font = '900 21px "Montserrat", system-ui, sans-serif'
      ctx.fillText(CHURCH_NAME, 94, 52)

      ctx.fillStyle = '#ffcc00'
      ctx.font = 'bold 13px "Montserrat", system-ui, sans-serif'
      ctx.fillText(CHURCH_LOCATION, 94, 72)

      // 3. Top Right Header
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffd700'
      ctx.font = 'bold 16px "Montserrat", system-ui, sans-serif'
      ctx.fillText('ANNUAL CONVENTION', CANVAS_SIZE - 40, 44)

      ctx.fillStyle = '#ffffff'
      ctx.font = '900 58px "Montserrat", sans-serif'
      ctx.fillText('WOMEN', CANVAS_SIZE - 40, 94)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 15px "Montserrat", system-ui, sans-serif'
      ctx.fillText('CONVENTION 2026', CANVAS_SIZE - 40, 116)

      // 4. Headline Text Above Frame
      ctx.textAlign = 'center'
      ctx.fillStyle = '#ffffff'
      ctx.font = '900 36px "Montserrat", system-ui, sans-serif'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)'
      ctx.shadowBlur = 12
      ctx.shadowOffsetY = 4
      ctx.fillText('I WILL ATTEND!', CANVAS_SIZE / 2, 170)
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // 5. Frame Card Container
      const frameX = 75
      const frameY = 192
      const frameW = 930
      const frameH = 785
      const frameRadius = 12

      ctx.save()
      ctx.shadowColor = 'rgba(30, 0, 10, 0.55)'
      ctx.shadowBlur = 26
      ctx.shadowOffsetY = 12

      const cardGrad = ctx.createLinearGradient(0, frameY, 0, frameY + frameH)
      cardGrad.addColorStop(0, CARD_THEME.bgGradStart)
      cardGrad.addColorStop(1, CARD_THEME.bgGradEnd)
      ctx.fillStyle = cardGrad

      drawRoundRect(ctx, frameX, frameY, frameW, frameH, frameRadius)
      ctx.fill()

      ctx.strokeStyle = CARD_THEME.borderColor
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.restore()

      // 6. User Photo Box inside Card
      const photoX = frameX + 16
      const photoY = frameY + 16
      const photoBoxW = frameW - 32
      const photoBoxH = 520

      drawImageCover(
        ctx, 
        photoImg, 
        photoX, 
        photoY, 
        photoBoxW, 
        photoBoxH, 
        6, 
        fitMode, 
        photoZoom, 
        photoOffsetX, 
        photoOffsetY
      )

      ctx.strokeStyle = '#f43f5e'
      ctx.lineWidth = 2
      drawRoundRect(ctx, photoX, photoY, photoBoxW, photoBoxH, 6)
      ctx.stroke()

      if (fullName.trim()) {
        const ribbonH = 46
        const ribbonY = photoY + photoBoxH - ribbonH
        ctx.fillStyle = 'rgba(139, 0, 50, 0.94)'
        ctx.fillRect(photoX, ribbonY, photoBoxW, ribbonH)

        ctx.textAlign = 'center'
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 23px "Montserrat", system-ui, sans-serif'
        ctx.fillText(fullName.trim().toUpperCase(), CANVAS_SIZE / 2, ribbonY + 31)
      }

      // 7. Bottom Schedule & Details Area
      const contentY = frameY + photoBoxH + 26
      const leftMargin = frameX + 28

      ctx.textAlign = 'left'
      ctx.fillStyle = CARD_THEME.textColor
      ctx.font = '900 32px "Montserrat", system-ui, sans-serif'
      ctx.fillText(EVENT_DATES, leftMargin, contentY + 18)

      ctx.fillStyle = CARD_THEME.dateColor
      ctx.font = 'bold 13.5px "Montserrat", system-ui, sans-serif'
      ctx.fillText(PROGRAM_1_TITLE, leftMargin, contentY + 50)

      ctx.fillStyle = CARD_THEME.textColor
      ctx.font = 'bold 17px "Montserrat", system-ui, sans-serif'
      ctx.fillText(PROGRAM_1_TIME, leftMargin, contentY + 70)

      const col2X = leftMargin + 320

      ctx.fillStyle = CARD_THEME.dateColor
      ctx.font = 'bold 13.5px "Montserrat", system-ui, sans-serif'
      ctx.fillText(PROGRAM_2_TITLE, col2X, contentY + 50)

      ctx.fillStyle = CARD_THEME.textColor
      ctx.font = 'bold 17px "Montserrat", system-ui, sans-serif'
      ctx.fillText(PROGRAM_2_TIME, col2X, contentY + 70)

      const dateY = contentY + 115
      ctx.fillStyle = '#8b0032'
      drawRoundRect(ctx, leftMargin, dateY - 14, 22, 22, 4)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 11px system-ui'
      ctx.fillText('📍', leftMargin + 3, dateY + 2)

      ctx.fillStyle = CARD_THEME.textColor
      ctx.font = 'bold 16px "Montserrat", system-ui, sans-serif'
      ctx.fillText(CHURCH_NAME, leftMargin + 32, dateY - 1)

      ctx.fillStyle = CARD_THEME.dateColor
      ctx.font = 'bold 13.5px "Montserrat", system-ui, sans-serif'
      ctx.fillText(CHURCH_LOCATION, leftMargin + 32, dateY + 17)

      ctx.fillStyle = CARD_THEME.dateColor
      ctx.font = 'bold 13.5px "Montserrat", system-ui, sans-serif'
      ctx.fillText(PROGRAM_3_TITLE, col2X, dateY - 2)

      ctx.fillStyle = CARD_THEME.textColor
      ctx.font = 'bold 17px "Montserrat", system-ui, sans-serif'
      ctx.fillText(PROGRAM_3_TIME, col2X, dateY + 17)

      // 8. Right Overlapping Ticket Badge
      const badgeW = 220
      const badgeX = frameX + frameW - badgeW - 20
      const badgeY = frameY + photoBoxH + 40

      const topTicketH = 95
      ctx.fillStyle = '#c2185b'
      drawTicketShape(ctx, badgeX, badgeY, badgeW, topTicketH, 12)
      ctx.fill()

      ctx.textAlign = 'center'
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px "Montserrat", system-ui, sans-serif'
      ctx.fillText(TICKET_TAG_TOP, badgeX + badgeW / 2, badgeY + 38)

      ctx.font = '900 38px "Montserrat", system-ui, sans-serif'
      ctx.fillText(TICKET_TAG_YEAR, badgeX + badgeW / 2, badgeY + 76)

      const confirmY = badgeY + topTicketH
      const confirmH = 46
      ctx.fillStyle = '#1e1e1e'
      ctx.fillRect(badgeX, confirmY, badgeW, confirmH)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px "Montserrat", sans-serif'
      ctx.fillText(TICKET_CONFIRM, badgeX + badgeW / 2, confirmY + 29)

      // 9. Bottom Footer
      const footerY = frameY + frameH + 34
      ctx.textAlign = 'center'
      ctx.fillStyle = '#ffcc00'
      ctx.font = 'bold 14px "Montserrat", system-ui, sans-serif'
      ctx.fillText(FOOTER_POWERED, CANVAS_SIZE / 2, footerY)

      ctx.fillStyle = '#ffffff'
      ctx.font = '500 13px "Montserrat", system-ui, sans-serif'
      ctx.fillText(SOCIAL_HANDLE, CANVAS_SIZE / 2, footerY + 22)

      // 10. Download
      const dataUrl = canvas.toDataURL('image/png', 1.0)
      const downloadLink = document.createElement('a')
      
      const fileSlug = (fullName || 'eagles-women-convention-2026')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
      downloadLink.download = `eagles-${fileSlug}-frame.png`
      downloadLink.href = dataUrl
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      setValidationState({
        type: 'success',
        text: '🎉 High-resolution souvenir photo frame downloaded successfully!'
      })
    } catch (err) {
      console.error('Frame generation failed:', err)
      setValidationState({
        type: 'error',
        text: 'Failed to generate photo frame. Please try again.'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50/60 to-red-50/40 text-slate-900 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* Hidden Offscreen Canvas for Export */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Responsive Navigation Header */}
      <header className="border-b border-rose-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-tr from-rose-700 to-amber-500 flex items-center justify-center font-bold text-white shadow-md shadow-rose-500/20 text-sm sm:text-lg border border-amber-400/40 shrink-0">
              🦅
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight text-rose-950 block leading-tight truncate max-w-[200px] sm:max-w-none">
                {CHURCH_NAME}
              </span>
              <span className="text-[10px] sm:text-xs text-rose-700 font-semibold block leading-tight">
                {EVENT_TITLE}
              </span>
            </div>
          </div>
          <span className="text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap">
            {EVENT_DATES}
          </span>
        </div>
      </header>

      {/* Main Responsive Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10">
        
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-rose-800 bg-rose-100 px-3 py-1 rounded-full border border-rose-200 mb-2 sm:mb-3 inline-block shadow-2xs">
            {CHURCH_NAME} &bull; {CHURCH_LOCATION}
          </span>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-rose-950 mt-1 mb-2">
            {EVENT_TITLE}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm font-medium px-2">
            Upload your picture, enter your name, and download your official 1:1 souvenir photo frame!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Responsive Form Controls */}
          <div className="lg:col-span-5 bg-white border border-rose-100 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 sm:space-y-6">
            
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-extrabold text-rose-950 flex items-center gap-2">
                <span>📷</span> Photo & Name Details
              </h2>
            </div>

            <form onSubmit={generateAndDownloadFrame} className="space-y-5 sm:space-y-6">
              
              {/* Option 1: Upload Picture */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                  1. Upload Picture <span className="text-rose-600">*</span>
                </label>

                {!photoUrl ? (
                  <label 
                    htmlFor="photo-upload-input"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/40 hover:bg-rose-50/80 rounded-xl p-5 sm:p-6 cursor-pointer transition group text-center"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-2xl sm:text-3xl mb-2 sm:mb-3 text-rose-600 group-hover:scale-110 transition">
                      📸
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-rose-950">
                      Tap to choose picture
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Supports JPG, JPEG, PNG, WebP (Max 25MB)
                    </span>
                    <input 
                      ref={fileInputRef}
                      id="photo-upload-input"
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="bg-slate-50 border border-rose-200 rounded-xl p-3 sm:p-3.5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-rose-600 shrink-0 bg-slate-900 shadow-md">
                        <img 
                          src={photoUrl} 
                          alt="Uploaded picture" 
                          className="w-full h-full"
                          style={{ 
                            objectFit: fitMode,
                            transform: `scale(${photoZoom / 100}) translate(${photoOffsetX}%, ${photoOffsetY}%)` 
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{photoName || 'Uploaded Picture'}</p>
                        <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-bold">
                          <span>✓</span> Photo ready
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-200 pt-2.5">
                      <label 
                        htmlFor="photo-replace-input"
                        className="flex-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold py-2 px-3 rounded-lg cursor-pointer transition text-center shadow-2xs"
                      >
                        Change Photo
                        <input 
                          id="photo-replace-input"
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold py-2 px-3 rounded-lg transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Responsive Photo Alignment & Fit Mode */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <span>🎯</span> Alignment & Fit Controls
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFitMode('contain')
                      setPhotoZoom(100)
                      setPhotoOffsetX(0)
                      setPhotoOffsetY(0)
                    }}
                    className="text-[10px] text-rose-700 hover:text-rose-900 underline font-bold"
                  >
                    Reset Fit
                  </button>
                </div>

                {/* Fit Mode Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Frame Fit Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFitMode('contain')}
                      className={`py-2 px-2.5 text-[11px] sm:text-xs font-bold rounded-lg border transition ${
                        fitMode === 'contain'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Show Full Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode('cover')}
                      className={`py-2 px-2.5 text-[11px] sm:text-xs font-bold rounded-lg border transition ${
                        fitMode === 'cover'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Fill Frame
                    </button>
                  </div>
                </div>

                {/* Zoom Scale */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span>Zoom Scale</span>
                    <span className="text-rose-700 font-mono">{photoZoom}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="150"
                    value={photoZoom}
                    onChange={(e) => setPhotoZoom(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                </div>

                {/* Move Left / Right */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span>Move Left / Right</span>
                    <span className="text-rose-700 font-mono">
                      {photoOffsetX > 0 ? `+${photoOffsetX}%` : `${photoOffsetX}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={photoOffsetX}
                    onChange={(e) => setPhotoOffsetX(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                </div>

                {/* Move Up / Down */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span>Move Up / Down</span>
                    <span className="text-rose-700 font-mono">
                      {photoOffsetY > 0 ? `+${photoOffsetY}%` : `${photoOffsetY}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={photoOffsetY}
                    onChange={(e) => setPhotoOffsetY(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                </div>

              </div>

              {/* Option 2: Input Name */}
              <div>
                <label htmlFor="full-name-input" className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                  2. Input Your Name
                </label>
                <input
                  id="full-name-input"
                  type="text"
                  placeholder="e.g. Sister Mercy Akpan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:bg-white focus:ring-2 focus:ring-rose-600/20 transition font-medium"
                />
              </div>

              {/* Validation Status Banner */}
              {validationState && (
                <div 
                  className={`p-3 sm:p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                    validationState.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <span>{validationState.type === 'error' ? '⚠️' : '🎉'}</span>
                  <span>{validationState.text}</span>
                </div>
              )}

              {/* Download Frame Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-rose-700 via-rose-600 to-rose-800 hover:from-rose-600 hover:to-rose-700 active:from-rose-800 text-white font-extrabold py-3.5 sm:py-4 px-4 rounded-xl shadow-lg shadow-rose-700/25 transition transform active:scale-[0.99] flex items-center justify-center gap-2 border border-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating Frame...</span>
                  </>
                ) : (
                  <>
                    <span>⬇️ Download Photo Frame (PNG)</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Real-Time Live Frame Preview Container */}
          <div className="lg:col-span-7 bg-white border border-rose-100 rounded-2xl p-3.5 sm:p-5 md:p-6 shadow-xl lg:sticky lg:top-20">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-rose-900 flex items-center gap-1.5 sm:gap-2">
                <span>✨</span> Real-Time Live Preview
              </h2>
              <span className="text-[9px] sm:text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 px-2 sm:px-2.5 py-0.5 rounded-full font-mono">
                1080 &times; 1080 px
              </span>
            </div>

            {/* Responsive Visual Frame Render */}
            <div className="relative aspect-square w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto rounded-xl overflow-hidden bg-gradient-to-b from-[#59001b] via-[#8b0032] to-[#420013] shadow-2xl p-3 sm:p-4 md:p-5 flex flex-col justify-between select-none border border-rose-400/40">
              
              {/* Header Bar */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-[#ffd700] flex items-center justify-center text-[10px] sm:text-xs shadow-md shrink-0">
                    🦅
                  </div>
                  <div>
                    <p className="text-white font-black text-[10px] sm:text-[11px] leading-none tracking-tight">{CHURCH_NAME}</p>
                    <p className="text-amber-400 text-[8px] sm:text-[9px] font-bold mt-0.5">{CHURCH_LOCATION}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[#ffd700] font-extrabold text-[8px] sm:text-[9px] tracking-wider">ANNUAL CONVENTION</p>
                  <p className="text-white font-black text-lg sm:text-xl leading-none my-0.5 tracking-tight">WOMEN</p>
                  <p className="text-white font-extrabold text-[7px] sm:text-[8px] tracking-widest">CONVENTION 2026</p>
                </div>
              </div>

              {/* Attendance Headline */}
              <div className="relative z-10 text-center my-1">
                <p className="text-white font-black text-xs sm:text-sm md:text-base uppercase tracking-tight drop-shadow-md">
                  I WILL ATTEND!
                </p>
              </div>

              {/* Locked Soft Rose & Cream Frame Card */}
              <div className={`relative z-10 rounded-md p-2 sm:p-2.5 shadow-2xl flex flex-col justify-between h-[70%] border ${CARD_THEME.cssClass}`} style={{ borderColor: CARD_THEME.borderColor }}>
                
                {/* Photo Area */}
                <div className="relative w-full h-[64%] rounded-sm overflow-hidden bg-slate-900 border border-rose-400">
                  <img 
                    src={activePhotoUrl} 
                    alt="Attendee Portrait" 
                    className="w-full h-full transition-all duration-150"
                    style={{ 
                      objectFit: fitMode,
                      transform: `scale(${photoZoom / 100}) translate(${photoOffsetX}%, ${photoOffsetY}%)`
                    }}
                  />
                  {fullName.trim() && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[#8b0032]/94 backdrop-blur-xs py-0.5 sm:py-1 text-center border-t border-amber-400/40 z-10">
                      <p className="text-white font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider truncate px-1">
                        {fullName}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Details Grid */}
                <div className="pt-1.5 sm:pt-2 flex items-end justify-between">
                  <div className="pr-1.5 sm:pr-2 min-w-0">
                    <p className="font-black text-xs sm:text-sm leading-tight uppercase" style={{ color: CARD_THEME.textColor }}>
                      {EVENT_DATES}
                    </p>
                    
                    <div className="mt-0.5 sm:mt-1 space-y-0.5">
                      <p className="font-extrabold text-[8px] sm:text-[9px]" style={{ color: CARD_THEME.dateColor }}>
                        {PROGRAM_1_TITLE}
                      </p>
                      <p className="font-extrabold text-[8.5px] sm:text-[9.5px]" style={{ color: CARD_THEME.textColor }}>
                        {PROGRAM_1_TIME}
                      </p>
                    </div>

                    <div className="mt-0.5 sm:mt-1">
                      <p className="font-extrabold text-[8px] sm:text-[9px] flex items-center gap-1" style={{ color: CARD_THEME.textColor }}>
                        <span className="text-[#8b0032]">📍</span> {CHURCH_NAME}
                      </p>
                      <p className="text-[7.5px] sm:text-[8px] pl-3 sm:pl-3.5 font-medium truncate" style={{ color: CARD_THEME.dateColor }}>
                        {CHURCH_LOCATION}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 w-20 sm:w-24 text-center rounded-sm overflow-hidden shadow-xl border border-amber-500/20">
                    <div className="bg-[#c2185b] text-white p-0.5 sm:p-1">
                      <p className="font-bold text-[8px] sm:text-[9px] leading-tight tracking-wider">{TICKET_TAG_TOP}</p>
                      <p className="font-black text-xs sm:text-base leading-none">{TICKET_TAG_YEAR}</p>
                    </div>
                    <div className="bg-[#1e1e1e] text-white py-0.5 sm:py-1">
                      <p className="font-bold text-[7.5px] sm:text-[8.5px] tracking-wider">{TICKET_CONFIRM}</p>
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom Footer */}
              <div className="relative z-10 text-center mt-0.5 sm:mt-1">
                <p className="text-amber-400 font-bold text-[8.5px] sm:text-[9.5px] truncate">
                  {FOOTER_POWERED}
                </p>
                <p className="text-white text-[7.5px] sm:text-[8.5px] truncate">
                  {SOCIAL_HANDLE}
                </p>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-rose-200 py-3.5 text-center text-[11px] sm:text-xs text-slate-500 bg-white">
        {CHURCH_NAME} &bull; {EVENT_TITLE} Photo Frame Generator
      </footer>

    </div>
  )
}
