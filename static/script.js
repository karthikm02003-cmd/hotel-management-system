function copyLink() {
    const birthdayLinkInput = document.getElementById('birthdayLink');
    birthdayLinkInput.select();
    birthdayLinkInput.setSelectionRange(0, 99999); // For mobile devices

    try {
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Could not copy link. Please copy it manually: ' + birthdayLinkInput.value);
    }
}