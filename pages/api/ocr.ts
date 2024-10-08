import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { IncomingForm } from 'formidable'
import fs from 'fs/promises'

export const config = {
  api: {
    bodyParser: false,
  },
};

const BAIDU_AK = process.env.BAIDU_AK
const BAIDU_SK = process.env.BAIDU_SK
let BAIDU_ACCESS_TOKEN = process.env.BAIDU_ACCESS_TOKEN

async function getBaiduAccessToken() {
  if (!BAIDU_AK || !BAIDU_SK) {
    throw new Error('Baidu API credentials are not set')
  }

  if (BAIDU_ACCESS_TOKEN) {
    return BAIDU_ACCESS_TOKEN
  }

  try {
    const response = await axios.post(
      'https://aip.baidubce.com/oauth/2.0/token',
      null,
      {
        params: {
          grant_type: 'client_credentials',
          client_id: BAIDU_AK,
          client_secret: BAIDU_SK,
        },
      }
    )
    BAIDU_ACCESS_TOKEN = response.data.access_token
    return BAIDU_ACCESS_TOKEN
  } catch (error) {
    console.error('Error getting Baidu access token:', error)
    throw error
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    await new Promise((resolve, reject) => {
      const form = new IncomingForm()

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err)
          res.status(500).json({ error: 'Failed to process upload' })
          return reject(err)
        }

        try {
          const fileOrFiles = files.image
          const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles
          if (!file || !file.filepath) {
            throw new Error('No file uploaded')
          }
          const imageBuffer = await fs.readFile(file.filepath)
          const imageBase64 = imageBuffer.toString('base64')
          
          const provider = (fields.provider as string[] | string | undefined)?.[0] || '';
          const apiType = (fields.apiType as string[] | string | undefined)?.[0] || '';

          if (provider === 'BAIDU') {
            const accessToken = await getBaiduAccessToken()

            let apiUrl = ''
            if (apiType === 'Financial Notes') {
              apiUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/multiple_invoice?access_token=${accessToken}`
            } else {
              throw new Error('Unsupported Baidu API type')
            }

            const response = await axios.post(
              apiUrl,
              `image=${encodeURIComponent(imageBase64)}`,
              {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json'
                }
              }
            )
            res.status(200).json(response.data)
          } else {
            res.status(400).json({ error: 'Unsupported OCR provider' })
          }
          resolve(null)
        } catch (error) {
          console.error('Error processing OCR request:', error)
          if (axios.isAxiosError(error)) {
            console.error('Axios error details:', error.response?.data)
          }
          res.status(500).json({ error: 'Failed to process OCR request' })
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error('API error:', error);
    // This is likely redundant now, but kept as a final fallback
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}