import { NextApiRequest, NextApiResponse } from 'next';
import { executeCode } from '../../middleware/codeExecutor/executeCode';
import { sanitizeErrorMessage } from '../../middleware/codeExecutor/utils';

interface ExecuteCodeRequestBody {
  code: string;
  language: string;
  stdin?: string;
  compileOptions?: any;
}

interface ExecuteCodeResponse {
  stdout?: string;
  stderr?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecuteCodeResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { code, language, stdin } = req.body as ExecuteCodeRequestBody;

  // validate input
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  try {
    // execute code and get output
    const result = await executeCode(code, language, stdin);

    if (result.error) {
      // runtime error
      return res.status(200).json({
        stdout: sanitizeErrorMessage(result.stdout),
        stderr: sanitizeErrorMessage(result.stderr),
        error: result.error,
      });
    } else {
      // execution successful
      return res.status(200).json(result);
    }
  } catch (error: any) {
    // catch error message
    return res.status(200).json({ error: error.message });
  }
}