import qrcode
from PIL import Image

# Create QR code instance
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)

# Add data to QR code (your portfolio URL)
qr.add_data('https://birduu.github.io')
qr.make(fit=True)

# Create QR code image
qr_image = qr.make_image(fill_color="black", back_color="white")

# Save the QR code
qr_image.save('portfolio-qr-code.png')

print("QR code generated successfully as 'portfolio-qr-code.png'") 