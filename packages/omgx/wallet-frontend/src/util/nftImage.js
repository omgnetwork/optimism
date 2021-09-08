import axios from 'axios';

export const getNftImageUrl = async (url) => {
    try {
        let res = await axios.get(url, {
            headers: {
                'Accept': ''
            }
        })
        if(res.headers && res.headers['content-type'].includes('application/json')) {
            const {image, attributes} = res.data;
            let id = image.split('://')[1];
            return { url: `https://ipfs.io/ipfs/${id}`, attributes }
        } else {
            return {url};
        }
    } catch(error) {
        // In case of error returning same url
        // As seems like some time it can be cors for images.
        console.log('Error while loading NFT image url', error.message);
        return {url};
    }
}


