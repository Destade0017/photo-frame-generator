import { useState, useRef } from 'react'

function App() {
  const [photoUrl, setPhotoUrl] = useState(null)
  const [photoName, setPhotoName] = useState('')
  const [fullName, setFullName] = useState('')
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [eventTag, setEventTag] = useState('OFFICIAL DELEGATE')
  const [validationState, setValidationState] = useState(null) // { type: 'error' | 'success', text: string }
  const [isGenerating, setIsGenerating] = useState(false)
  
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)

  // Handle Photo File Selection & Validation
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type.toLowerCase())) {
      setValidationState({
        type: 'error',
        text: 'Invalid file format. Please upload a JPG, JPEG, or PNG image.'
      })
      if (e.target) e.target.value = ''
      return
    }

    // Validate file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setValidationState({
        type: 'error',
        text: 'Image size is too large. Please select an image under 25MB.'
      })
      if (e.target) e.target.value = ''
      return
    }

    // Clean up previous URL to prevent memory leaks
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl)
    }

    const url = URL.createObjectURL(file)
    setPhotoUrl(url)
    setPhotoName(file.name)
    setValidationState(null)
  }

  // Handle Photo Removal
  const handleRemovePhoto = () => {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl)
    }
    setPhotoUrl(null)
    setPhotoName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setValidationState(null)
  }

  // Draw Photo with Object-Fit Cover Math on Canvas
  const drawImageCover = (ctx, img, x, y, width, height, radius = 0) => {
    const imgRatio = img.naturalWidth / img.naturalHeight
    const targetRatio = width / height
    let sWidth, sHeight, sx, sy

    if (imgRatio > targetRatio) {
      sHeight = img.naturalHeight
      sWidth = sHeight * targetRatio
      sx = (img.naturalWidth - sWidth) / 2
      sy = 0
    } else {
      sWidth = img.naturalWidth
      sHeight = sWidth / targetRatio
      sx = 0
      sy = (img.naturalHeight - sHeight) / 2
    }

    ctx.save()
    if (radius > 0) {
      ctx.beginPath()
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, radius)
      } else {
        // Fallback for roundRect
        ctx.rect(x, y, width, height)
      }
      ctx.clip()
    }
    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height)
    ctx.restore()
  }

  // Truncate text for Canvas rendering if it exceeds maxWidth
  const getTruncatedText = (ctx, text, maxWidth) => {
    if (ctx.measureText(text).width <= maxWidth) return text
    let truncated = text
    while (truncated.length > 0 && ctx.measureText(truncated + '…').width > maxWidth) {
      truncated = truncated.slice(0, -1)
    }
    return truncated + '…'
  }

  // Generate Frame Canvas & Trigger PNG Download
  const generateAndDownloadFrame = async (e) => {
    e.preventDefault()

    // Form Validation Checks
    if (!photoUrl && !fullName.trim()) {
      setValidationState({
        type: 'error',
        text: 'Please upload a photo and enter your Full Name to generate your frame.'
      })
      return
    }

    if (!photoUrl) {
      setValidationState({
        type: 'error',
        text: 'Please select a photo before generating your frame.'
      })
      return
    }

    if (!fullName.trim()) {
      setValidationState({
        type: 'error',
        text: 'Please enter your Full Name before generating your frame.'
      })
      return
    }

    setIsGenerating(true)
    setValidationState(null)

    try {
      // 1. Create offscreen canvas with fixed 4:5 resolution (1080 x 1350 px)
      const CANVAS_WIDTH = 1080
      const CANVAS_HEIGHT = 1350
      
      const canvas = canvasRef.current || document.createElement('canvas')
      canvas.width = CANVAS_WIDTH
      canvas.height = CANVAS_HEIGHT
      const ctx = canvas.getContext('2d')

      // Load uploaded user photo
      const userImg = new Image()
      userImg.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        userImg.onload = resolve
        userImg.onerror = () => reject(new Error('Failed to load uploaded image.'))
        userImg.src = photoUrl
      })

      // 2. Draw Frame Background (Deep Slate & Gradient Glow)
      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      bgGradient.addColorStop(0, '#090d16')
      bgGradient.addColorStop(0.5, '#0f172a')
      bgGradient.addColorStop(1, '#05070c')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Background Ambient Radial Glow
      const radialGlow = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, 450, 50,
        CANVAS_WIDTH / 2, 450, 600
      )
      radialGlow.addColorStop(0, 'rgba(99, 102, 241, 0.18)')
      radialGlow.addColorStop(1, 'rgba(99, 102, 241, 0)')
      ctx.fillStyle = radialGlow
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Decorative Outer Gold/Indigo Double Border Line
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)'
      ctx.lineWidth = 12
      ctx.strokeRect(24, 24, CANVAS_WIDTH - 48, CANVAS_HEIGHT - 48)

      ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)'
      ctx.lineWidth = 4
      ctx.strokeRect(36, 36, CANVAS_WIDTH - 72, CANVAS_HEIGHT - 72)

      // Decorative Corner Brackets
      const cornerSize = 40
      ctx.strokeStyle = '#6366f1'
      ctx.lineWidth = 6
      
      // Top-Left Corner
      ctx.beginPath()
      ctx.moveTo(48, 48 + cornerSize)
      ctx.lineTo(48, 48)
      ctx.lineTo(48 + cornerSize, 48)
      ctx.stroke()

      // Top-Right Corner
      ctx.beginPath()
      ctx.moveTo(CANVAS_WIDTH - 48 - cornerSize, 48)
      ctx.lineTo(CANVAS_WIDTH - 48, 48)
      ctx.lineTo(CANVAS_WIDTH - 48, 48 + cornerSize)
      ctx.stroke()

      // Bottom-Left Corner
      ctx.beginPath()
      ctx.moveTo(48, CANVAS_HEIGHT - 48 - cornerSize)
      ctx.lineTo(48, CANVAS_HEIGHT - 48)
      ctx.lineTo(48 + cornerSize, CANVAS_HEIGHT - 48)
      ctx.stroke()

      // Bottom-Right Corner
      ctx.beginPath()
      ctx.moveTo(CANVAS_WIDTH - 48 - cornerSize, CANVAS_HEIGHT - 48)
      ctx.lineTo(CANVAS_WIDTH - 48, CANVAS_HEIGHT - 48)
      ctx.lineTo(CANVAS_WIDTH - 48, CANVAS_HEIGHT - 48 - cornerSize)
      ctx.stroke()

      // 3. Top Header Event Banner
      const headerBoxY = 70
      const headerBoxHeight = 70
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
      ctx.beginPath()
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(80, headerBoxY, CANVAS_WIDTH - 160, headerBoxHeight, 16)
      } else {
        ctx.rect(80, headerBoxY, CANVAS_WIDTH - 160, headerBoxHeight)
      }
      ctx.fill()
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#a5b4fc'
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        (eventTag || 'OFFICIAL DELEGATE').toUpperCase(),
        CANVAS_WIDTH / 2,
        headerBoxY + headerBoxHeight / 2
      )

      // 4. Draw User Photo Area (Centered 860x860 px)
      const photoX = 110
      const photoY = 170
      const photoW = CANVAS_WIDTH - 220
      const photoH = 860
      const photoRadius = 32

      // Draw Photo Cover
      drawImageCover(ctx, userImg, photoX, photoY, photoW, photoH, photoRadius)

      // Photo Frame Border
      ctx.strokeStyle = '#4f46e5'
      ctx.lineWidth = 8
      ctx.beginPath()
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius)
      } else {
        ctx.rect(photoX, photoY, photoW, photoH)
      }
      ctx.stroke()

      // 5. Draw Bottom Overlay Card (Personalized Name & Details)
      const footerY = 1060
      const footerH = 210
      const footerW = CANVAS_WIDTH - 160
      const footerX = 80

      // Card Gradient Fill
      const footerGrad = ctx.createLinearGradient(0, footerY, 0, footerY + footerH)
      footerGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)')
      footerGrad.addColorStop(1, 'rgba(9, 13, 22, 0.98)')

      ctx.fillStyle = footerGrad
      ctx.beginPath()
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(footerX, footerY, footerW, footerH, 24)
      } else {
        ctx.rect(footerX, footerY, footerW, footerH)
      }
      ctx.fill()

      // Card Border & Glow
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)'
      ctx.lineWidth = 3
      ctx.stroke()

      // Render Full Name (Auto-scaled / Truncated for edge cases)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      let nameFontSize = 46
      ctx.font = `bold ${nameFontSize}px system-ui, -apple-system, sans-serif`
      const maxTextWidth = footerW - 60

      const safeName = getTruncatedText(ctx, fullName.trim(), maxTextWidth)
      
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 8
      ctx.fillText(safeName, CANVAS_WIDTH / 2, footerY + 36)
      ctx.shadowBlur = 0 // Reset shadow

      // Render Additional Details (Optional)
      if (additionalDetails.trim()) {
        ctx.font = '500 28px system-ui, -apple-system, sans-serif'
        ctx.fillStyle = '#818cf8'
        const safeDetails = getTruncatedText(ctx, additionalDetails.trim(), maxTextWidth)
        ctx.fillText(safeDetails, CANVAS_WIDTH / 2, footerY + 96)
      }

      // Small Badge Ribbon on Footer
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
      ctx.fillStyle = '#64748b'
      const badgeY = additionalDetails.trim() ? footerY + 150 : footerY + 115
      ctx.fillText('PROUDLY PARTICIPATING • 2026', CANVAS_WIDTH / 2, badgeY)

      // 6. Trigger Instant PNG File Download
      const dataUrl = canvas.toDataURL('image/png', 1.0)
      const downloadLink = document.createElement('a')
      
      const cleanFileName = fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-') || 'event'
      downloadLink.download = `${cleanFileName}-photo-frame.png`
      downloadLink.href = dataUrl
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      setValidationState({
        type: 'success',
        text: '🎉 Frame generated successfully! Your PNG download has started.'
      })
    } catch (err) {
      console.error('Canvas generation error:', err)
      setValidationState({
        type: 'error',
        text: 'An error occurred while generating the frame. Please try again with a different photo.'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Hidden Offscreen Canvas for Image Export */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 text-base">
              🖼️
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block leading-none">
                Frame Studio
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Event Photo Frame Creator</span>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            4:5 Souvenir Frame
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 md:py-10">
        {/* Intro Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white">
            Personalized Event Frame
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Upload your portrait, enter your details, and download a high-resolution 4:5 souvenir photo frame ready to share!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Form Controls Column */}
          <div className="md:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            
            <form onSubmit={generateAndDownloadFrame} className="space-y-5">
              {/* Photo Upload Section */}
              <div>
                <label className="block text-sm font-semibold text-white mb-1">
                  1. Select Photo <span className="text-indigo-400">*</span>
                </label>
                <p className="text-xs text-slate-400 mb-3">Upload a clear photo (JPG, JPEG, PNG)</p>

                {!photoUrl ? (
                  <label 
                    htmlFor="photo-upload-input"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 hover:bg-slate-950 rounded-xl p-6 sm:p-8 cursor-pointer transition group text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl mb-3 text-indigo-400 group-hover:scale-110 transition">
                      📷
                    </div>
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                      Tap to choose photo
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      Supports JPG, JPEG, PNG (Max 25MB)
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
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-indigo-500/40 shrink-0 bg-slate-900">
                        <img 
                          src={photoUrl} 
                          alt="Uploaded preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{photoName || 'Uploaded Photo'}</p>
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <span>✓</span> Photo loaded successfully
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-900 pt-3">
                      <label 
                        htmlFor="photo-replace-input"
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 px-3 rounded-lg cursor-pointer transition text-center"
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
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium py-2 px-3 rounded-lg transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Name Field */}
              <div className="border-t border-slate-800 pt-4">
                <label htmlFor="full-name-input" className="block text-sm font-semibold text-white mb-1">
                  2. Full Name <span className="text-indigo-400">*</span>
                </label>
                <input
                  id="full-name-input"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    setValidationState(null)
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Additional Details Field (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="additional-details-input" className="block text-sm font-semibold text-white">
                    3. Additional Details
                  </label>
                  <span className="text-[11px] text-slate-500 uppercase font-medium">Optional</span>
                </div>
                <input
                  id="additional-details-input"
                  type="text"
                  placeholder="e.g. IT Department, Class of 2026"
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Event Tag/Badge Field (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="event-tag-input" className="block text-sm font-semibold text-white">
                    4. Frame Badge Text
                  </label>
                  <span className="text-[11px] text-slate-500 uppercase font-medium">Badge Tag</span>
                </div>
                <input
                  id="event-tag-input"
                  type="text"
                  placeholder="e.g. OFFICIAL DELEGATE"
                  value={eventTag}
                  onChange={(e) => setEventTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Validation Feedback Banner */}
              {validationState && (
                <div 
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                    validationState.type === 'error'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  <span className="text-base leading-none">
                    {validationState.type === 'error' ? '⚠️' : '🎉'}
                  </span>
                  <span>{validationState.text}</span>
                </div>
              )}

              {/* Generate & Download Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:from-indigo-700 active:to-purple-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating Frame...</span>
                    </>
                  ) : (
                    <>
                      <span>⬇️ Download Frame (PNG)</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>

          {/* Frame Live Preview Card (4:5 Ratio Visual Preview) */}
          <div className="md:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Live Frame Preview</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
                4:5 Ratio
              </span>
            </h2>

            {/* Styled 4:5 Aspect Ratio Frame Preview */}
            <div className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-indigo-500/40 bg-slate-950 shadow-2xl flex flex-col justify-between p-4 sm:p-5 text-center select-none">
              
              {/* Outer Decorative Border Lines */}
              <div className="absolute inset-2 border border-indigo-500/20 rounded-xl pointer-events-none z-10" />
              <div className="absolute inset-3 border border-rose-500/15 rounded-lg pointer-events-none z-10" />

              {/* Photo Area (Centered 1:1 or Cover Fit) */}
              <div className="absolute inset-0 z-0 bg-slate-950 flex items-center justify-center">
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl mx-auto mb-3 opacity-60">
                      🖼️
                    </div>
                    <p className="text-slate-400 text-xs font-medium">No photo selected</p>
                    <p className="text-slate-600 text-[11px] mt-1">Upload a photo to view preview</p>
                  </div>
                )}
              </div>

              {/* Top Header Badge */}
              <div className="relative z-20 self-center bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-xl border border-indigo-500/30 shadow-lg mt-2">
                <span className="text-[11px] font-bold tracking-widest uppercase text-indigo-300">
                  {eventTag.trim() || 'OFFICIAL DELEGATE'}
                </span>
              </div>

              {/* Bottom Details Overlay Panel */}
              <div className="relative z-20 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-xl border border-indigo-500/30 text-center shadow-xl mb-1">
                <p className="text-base sm:text-lg font-extrabold text-white truncate drop-shadow-sm">
                  {fullName.trim() || 'Your Name'}
                </p>
                {additionalDetails.trim() && (
                  <p className="text-xs font-semibold text-indigo-300 truncate mt-0.5">
                    {additionalDetails.trim()}
                  </p>
                )}
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1.5">
                  PROUDLY PARTICIPATING &bull; 2026
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        Frame Studio &bull; Event Souvenir Photo Frame Generator
      </footer>
    </div>
  )
}

export default App
