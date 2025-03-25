import React from 'react';
import { useState, useEffect } from 'react'
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { AppBar, Toolbar, Typography, Switch, Container, Autocomplete, TextField, Box } from '@mui/material'
import './App.css'
import * as locales from './locales';

type DictionaryEntry = {
  finnish: string;
  romani: string;
};

function App() {
  // true means search by Finnish word; false means search by Romani.
  const [isFinnishSearch, setIsFinnishSearch] = useState(true)
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<{ label: string; translation: string } | null>(null)

  useEffect(() => {
    // Combine all locales imported from locales.ts
    const combined: { [key: string]: string[] } = {};
    Object.values(locales).forEach(obj => {
      Object.assign(combined, obj);
    });
    const dictArray = Object.entries(combined).map(
      ([finnish, translations]) => ({
        finnish,
        romani: Array.isArray(translations)
          ? translations.join(", ")
          : translations,
      })
    );
    setDictionary(dictArray);
  }, [])
  
  const normalize = (str: string) => {
    return str.toLowerCase()
              .replace(/ȟ/g, 'h')
              .replace(/š/g, "s")
              .replace(/ž/g, "z");
  }
  
  const handleToggle = () => {
    setIsFinnishSearch((prev) => !prev)
  }
  
  const options = dictionary.map((entry: DictionaryEntry) => 
    isFinnishSearch ? { label: entry.finnish, translation: entry.romani } 
                    : { label: entry.romani, translation: entry.finnish }
  ).sort((a, b) => a.label.localeCompare(b.label));
  
  const LISTBOX_PADDING = 8; // padding added top/bottom

  function renderRow(props: ListChildComponentProps) {
    const { data, index, style } = props;
    const element = data[index] as React.ReactElement<{ style?: React.CSSProperties }>;
    return React.cloneElement(element, {
      style: {
        ...element.props.style,
        ...style,
        top: ((typeof element.props.style?.top === 'number'
                ? element.props.style.top
                : 0) +
              (style.top as number) +
              LISTBOX_PADDING),
      },
    });
  }

  const VirtualizedListbox = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(
    function VirtualizedListbox(props, ref) {
      const { children, ...other } = props;
      const itemData = React.Children.toArray(children);
      const itemCount = itemData.length;
      const height = Math.min(8, itemCount) * 48; // each item is assumed to be ~48px tall

      return (
        <div ref={ref} {...other}>
          <FixedSizeList
            height={height + 2 * LISTBOX_PADDING}
            width="100%"
            itemSize={48}
            itemCount={itemCount}
            itemData={itemData}
          >
            {renderRow}
          </FixedSizeList>
        </div>
      );
    }
  );
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography variant="h6">
            {isFinnishSearch ? "Suomi – romanikieli" : "Kaalengo – fintiko"}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ position: 'fixed', top: 10, right: 10, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ mr: 1 }}>
          {isFinnishSearch ? 'suomi' : 'kaalengo'}
        </Typography>
        <Switch checked={!isFinnishSearch} onChange={handleToggle} />
      </Box>
      <Container maxWidth="sm" sx={{ mt: { xs: 2, md: 5 }, px: { xs: 2, md: 0 } }}>
        <Autocomplete
          sx={{ width: { xs: '100%', sm: '500px' } }}
          ListboxComponent={VirtualizedListbox}
          options={options}
          getOptionLabel={(option) => option.label}
          onChange={(_, newValue) => setSelectedEntry(newValue)}
          filterOptions={(opts, { inputValue }) => {
            const normalizedInput = normalize(inputValue);
            return opts.filter(option => normalize(option.label).startsWith(normalizedInput));
          }}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <li key={key} {...rest}>
                <div
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%'
                  }}
                >
                  {option.label} - {option.translation}
                </div>
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField {...params} label="Etsi sana" variant="outlined" />
          )}
        />
        <Box mt={2} sx={{ minHeight: '100px', textAlign: 'center' }}>
          {selectedEntry ? (
            <Box p={2} border="1px solid #ccc" borderRadius="4px">
              <Typography variant="h5" align="center">{selectedEntry.label}</Typography>
              <Typography
                variant="subtitle1"
                align="center"
                sx={{
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '80%',
                  margin: '0 auto',
                }}
              >
                {selectedEntry.translation}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Container>
      <footer style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', padding: '10px', fontSize: 'smaller' }}>
        Source: <a href="https://sanat.csc.fi/wiki/Suomen_romanikielen_verkkosanakirja" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
          https://sanat.csc.fi/wiki/Suomen_romanikielen_verkkosanakirja
        </a>
      </footer>
    </>
  )
}

export default App
