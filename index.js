document.getElementById('inputText').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('inputText').blur();
    }
});

document.getElementById('fetchButton').addEventListener('click', async () => {
    const inputText = document.getElementById('inputText').value;
    const spinner = document.getElementById('spinner');
    const resultContainer = document.getElementById('resultContainer');

    spinner.style.display = 'block';
    resultContainer.innerHTML = '';

    try {
        const response = await fetch('https://ydal0y9qxh.execute-api.us-west-2.amazonaws.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                body: inputText,
            }),
        });

        const data = await response.json();

        const url = new URL('/vr.html', window.location.origin);
        data.forEach((item, index) => {
            url.searchParams.append(`dance_move_${index + 1}`, item.dance_move);
            url.searchParams.append(`dance_file_${index + 1}`, item.dance_file);
        });

        window.location.href = url.href;
    } catch (error) {
        console.error('Error fetching dance moves:', error);
        resultContainer.innerHTML = '<p style="color: red;">Failed to fetch dance moves. Please try again.</p>';
    } finally {
        spinner.style.display = 'none';
    }
});
