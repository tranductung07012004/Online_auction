import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box, Typography } from '@mui/material';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  error,
  helperText,
  placeholder = 'Provide detailed information about your product...',
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['link', 'image'],
        [{ color: [] }, { background: [] }],
        ['clean'],
      ],
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'align',
    'link',
    'image',
    'color',
    'background',
  ];

  return (
    <Box>
      <Box
        sx={{
          '& .quill': {
            backgroundColor: '#FFFFFF',
          },
          '& .ql-container': {
            fontFamily: 'inherit',
            fontSize: '1rem',
            minHeight: '200px',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            borderColor: error ? '#D32F2F' : '#D4C4B0',
            '&:hover': {
              borderColor: error ? '#D32F2F' : '#8B7355',
            },
            '&.ql-focused': {
              borderColor: '#8B7355',
            },
          },
          '& .ql-toolbar': {
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            borderColor: error ? '#D32F2F' : '#D4C4B0',
            backgroundColor: '#FAF7F4',
            '&:hover': {
              borderColor: error ? '#D32F2F' : '#8B7355',
            },
            '&.ql-focused': {
              borderColor: '#8B7355',
            },
            '& .ql-stroke': {
              stroke: '#4A3C2F',
            },
            '& .ql-fill': {
              fill: '#4A3C2F',
            },
            '& .ql-picker-label': {
              color: '#4A3C2F',
            },
            '& .ql-picker-options': {
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8DED1',
            },
            '& button:hover, & button.ql-active': {
              color: '#8B7355',
              '& .ql-stroke': {
                stroke: '#8B7355',
              },
              '& .ql-fill': {
                fill: '#8B7355',
              },
            },
          },
          '& .ql-editor': {
            minHeight: '200px',
            color: '#4A3C2F',
            '&.ql-blank::before': {
              color: '#A0907C',
              fontStyle: 'normal',
            },
          },
        }}
      >
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
      </Box>
      {helperText && (
        <Typography
          variant="caption"
          sx={{
            color: error ? '#D32F2F' : '#A0907C',
            mt: 0.5,
            display: 'block',
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}








