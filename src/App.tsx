import React from 'react';
import { useState, useEffect } from 'react'
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { AppBar, Toolbar, Typography, Switch, Container, Autocomplete, TextField, Box } from '@mui/material'
import './App.css'

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
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ".split("")
    Promise.all(
      letters.map(letter =>
        fetch(`/locales/${letter}.json`).then(res => {
          if (res.ok) return res.json()
          return {}
        })
      )
    )
      .then(results => {
        const combined: { [key: string]: string[] } = {}
        results.forEach(result => {
          Object.assign(combined, result)
        })
        const dictArray = Object.entries(combined).map(
          ([finnish, translations]) => ({
            finnish,
            romani: Array.isArray(translations)
              ? translations.join(", ")
              : translations,
          })
        )
        setDictionary(dictArray)
      })
      .catch(err => console.error(err))
  }, [])
  
  const normalize = (str: string) => {
    return str.toLowerCase().replace(/ȟ/g, 'h');
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
    return React.cloneElement(data[index] as React.ReactElement, {
      style: {
        ...style,
        top: (style.top as number) + LISTBOX_PADDING,
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
        <Toolbar>
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
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Autocomplete
          sx={{ width: '500px' }}
          ListboxComponent={VirtualizedListbox}
          options={options}
          getOptionLabel={(option) => option.label}
          onChange={(event, newValue) => setSelectedEntry(newValue)}
          filterOptions={(opts, { inputValue }) => {
            const normalizedInput = normalize(inputValue);
            return opts.filter(option => normalize(option.label).startsWith(normalizedInput));
          }}
          renderOption={(props, option) => (
            <li {...props}>
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
          )}
          renderInput={(params) => (
            <TextField {...params} label="Etsi sana" variant="outlined" />
          )}
        />
        <Box mt={2} sx={{ minHeight: '100px' }}>
          {selectedEntry ? (
            <Box p={2} border="1px solid #ccc" borderRadius="4px">
              <Typography variant="h5">{selectedEntry.label}</Typography>
              <Typography variant="subtitle1">{selectedEntry.translation}</Typography>
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
