const axios = require('axios');
require('dotenv').config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
let maxLength = 500
async function generate(prompt, max_length_=500) {
    try {
        const modelName = "mistralai/Mistral-7B-Instruct-v0.3";
        const response = await axios.post(
            `https://api-inference.huggingface.co/models/${modelName}`,
            {
                inputs: prompt,
                parameters: {
                    max_length: max_length_,
                    temperature: 0.7
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Access the generated text properly
        const generated_text = response.data[0]?.generated_text || "";
        const cleaned_text = generated_text.substr(prompt.length); // Remove the prompt from the response

        // Clean the text by removing any new line characters
        const final_cleaned_text = cleaned_text.replace(/\n+/g, ' ').trim();

        const last_sentence_end = Math.max(
            final_cleaned_text.lastIndexOf('.'),
            final_cleaned_text.lastIndexOf('!'),
            final_cleaned_text.lastIndexOf('?')
        );

        const final_text = last_sentence_end !== -1 ? final_cleaned_text.slice(0, last_sentence_end + 1) : final_cleaned_text;

        return { generated_text: final_text.trim() };
    } catch (error) {
        console.error('An error occurred:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        return { error: 'Internal Server Error' };
    }
}
async function generateCompletion(prompt){
    const generation = await generate(prompt, maxLength)
    return generation["generated_text"]
}
function setMaxLength(newMaxLength){
    maxLength = newMaxLength;
    return maxLength;
}

module.exports = {
    generateCompletion,
    setMaxLength
};

/*const prompt = "Find the value of x: 8(x*4) = 6(x+2)"

generate(prompt)
    .then(res => console.log(res.generated_text))
    .catch(err => console.error(err));*/
