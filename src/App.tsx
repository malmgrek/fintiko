import { useState, useEffect } from 'react'
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
  
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Finnish-Romani Dictionary
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ position: 'fixed', top: 10, right: 10, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ mr: 1 }}>
          {isFinnishSearch ? 'Finnish' : 'Romani'}
        </Typography>
        <Switch checked={!isFinnishSearch} onChange={handleToggle} />
      </Box>
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Autocomplete 
          options={options}
          getOptionLabel={(option) => option.label}
          filterOptions={(opts, { inputValue }) => {
            const normalizedInput = normalize(inputValue);
            return opts.filter(option => normalize(option.label).startsWith(normalizedInput));
          }}
          renderOption={(props, option) => (
            <li {...props}>
              {option.label} - {option.translation}
            </li>
          )}
          renderInput={(params) => (
            <TextField {...params} label="Search word" variant="outlined" />
          )}
        />
      </Container>
    </>
  )
}

export default App
