const APP_KEY = 'cga1cb2srj871bc';
const APP_SECRET = 'agbl98w3ikf056r';
const REFRESH_TOKEN = 'LQxgs0TOvngAAAAAAAAAAZaZdlW8FhPwCpUnY5ySntcee4Y9zsMWfvveRZR1lJ_x';

let accessToken = '';

export const refreshAccessToken = async () => {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', REFRESH_TOKEN);
    params.append('client_id', APP_KEY);
    params.append('client_secret', APP_SECRET);

    try {
        const response = await fetch('https://api.dropbox.com/oauth2/token', {
            method: 'POST',
            body: params
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Dropbox Token Error:', errorData);
            throw new Error('Failed to refresh access token');
        }

        const data = await response.json();
        accessToken = data.access_token;
        return accessToken;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
    }
};

export const listFolder = async (path = '') => {
    if (!accessToken) await refreshAccessToken();

    try {
        const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path,
                recursive: false,
                include_media_info: true
            })
        });

        if (response.status === 401) {
            await refreshAccessToken();
            return listFolder(path);
        }

        if (!response.ok) {
            throw new Error('Failed to list folder');
        }

        const data = await response.json();
        return data.entries;
    } catch (error) {
        console.error('Error listing folder:', error);
        throw error;
    }
};

export const getTemporaryLink = async (path) => {
    if (!accessToken) await refreshAccessToken();

    try {
        const response = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path })
        });

        if (response.status === 401) {
            await refreshAccessToken();
            return getTemporaryLink(path);
        }

        if (!response.ok) {
            throw new Error('Failed to get temporary link');
        }

        const data = await response.json();
        return data.link;
    } catch (error) {
        console.error('Error getting temporary link:', error);
        throw error;
    }
};

export const uploadFile = async (file) => {
    if (!accessToken) await refreshAccessToken();

    try {
        const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({
                    path: `/${file.name}`,
                    mode: 'add',
                    autorename: true,
                    mute: false,
                    strict_conflict: false
                }),
                'Content-Type': 'application/octet-stream'
            },
            body: file
        });

        if (response.status === 401) {
            await refreshAccessToken();
            return uploadFile(file);
        }

        if (!response.ok) {
            throw new Error('Failed to upload file');
        }

        return await response.json();
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};
