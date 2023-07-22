import { useState, useEffect, useRef } from "react";
import { SearchIcon, DarkModeIcon, BookIcon, AudioIcon } from "./icons";

export function App() {
  const [darkMode, setDarkMode] = useState(false);

  const [font, setFont] = useState(" serif");

  const [initData, setData] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  return (
    <main className={`${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className={`container `} style={{ fontFamily: font }}>
        <Nav
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          font={font}
          setFont={setFont}
        />

        <Search
          setData={setData}
          darkMode={darkMode}
          setIsLoading={setIsLoading}
          setError={setError}
        />

        {error && <ErrorMessage error={error} />}
        {isLoading && <LoadingMessage />}

        {!isLoading && <SearchedWordInfo data={initData} darkMode={darkMode} />}
      </div>
    </main>
  );
}

const Nav = function ({ darkMode, setDarkMode, font, setFont }) {
  const handleDarkMode = function () {
    setDarkMode(!darkMode);
  };

  return (
    <nav className="nav">
      <span className="book-icon">
        <BookIcon darkMode={darkMode} />
      </span>

      <div className="select-box">
        <select value={font} onChange={(e) => setFont(e.target.value)}>
          <option value=" serif"> serif</option>
          <option value="sans serif">sans serif</option>

          <option value="monospace">monospace</option>

          <option value="Open Sans">open sans</option>
        </select>
        <span className="line">|</span>
        <span
          className={`span-container ${darkMode ? "dark-background" : ""}`}
          onClick={handleDarkMode}
        >
          {" "}
          <span
            className={`span-item ${
              darkMode ? "transform-right" : "transform-left"
            }`}
          >
            &nbsp;
          </span>
        </span>

        <span className="dark-mode-icon">
          <DarkModeIcon darkMode={darkMode} />
        </span>
      </div>
    </nav>
  );
};

////////////
// SEARCH WORD
////////////

const Search = function ({ setData, setIsLoading, setError }) {
  const [inputVal, setInputVal] = useState("");

  const value = useRef(null);

  useEffect(() => {
    value.current.focus();
  }, []);

  const handleInput = function (e) {
    setInputVal(e.target.value);
  };

  const fetchWord = async function () {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${inputVal}`
      );

      if (!res.ok)
        throw new Error(
          "Sorry pal, we couldn't find the definition of your searched term. You might have a typo"
        );

      const data = await res.json();

      setData(data);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = function () {
    if (!inputVal) return;
    fetchWord();
  };

  useEffect(() => {
    const onEnterKey = function (e) {
      if (e.key === "Enter") handleSubmit();
    };

    document.addEventListener("keydown", onEnterKey);

    return () => document.removeEventListener("keydown", onEnterKey);
  });

  return (
    <div className="input-container">
      <input
        type="text"
        placeholder="search"
        value={inputVal}
        onChange={handleInput}
        ref={value}
      />
      <span className={`search-icon `} onClick={handleSubmit}>
        <SearchIcon />
      </span>
    </div>
  );
};

//////////
// LOAD
/////////
const LoadingMessage = function () {
  return <p className="loading">Loading...</p>;
};

///////////
// ERROR MESSAGE
///////////

const ErrorMessage = function ({ error }) {
  return <p className="error">{error}</p>;
};

/////
// AUDIO STATS
/////////

const SearchedWordInfo = function ({ data, darkMode }) {
  const [audioState, setAudioState] = useState(true);

  if (data.length < 1) return;

  const { word, meanings, sourceUrls, phonetic, phonetics } = data.at(0);

  const audioUrl = phonetics
    .map((el) => el.audio)
    .find((element) => element !== "");

  const audioEl = new Audio(audioUrl);

  const handleMicClick = () => {
    audioUrl ? audioEl.play() : setAudioState(false);

    setTimeout(() => {
      setAudioState(true);
    }, 2000);
  };

  return (
    <>
      <div className="word-container">
        <div className="audio">
          <h2>{word}</h2>
          <p className="phonetic-text">{phonetic}</p>
        </div>
        {!audioState && <AudioStateMessage audioState={audioState} />}
        <AudioIcon onClick={handleMicClick} />
      </div>

      <div className="meanings">
        {meanings.map((meaning, i) => {
          const {
            partOfSpeech: speech,
            definitions,
            synonyms,
            antonyms,
          } = meaning;

          return (
            <div key={i} className="speech-box">
              <h3 className="speech">
                {speech}
                <span
                  className="border-line"
                  style={darkMode ? { backgroundColor: "#fff" } : {}}
                >
                  &nbsp;
                </span>
              </h3>

              <p className="meaning">Meaning</p>

              <ul>
                {definitions.map((def, i) => {
                  return (
                    <li key={i} className="def-list">
                      {def.definition}
                    </li>
                  );
                })}
              </ul>
              {synonyms.length > 0 && (
                <p className="synonym-text">
                  Synonyms:
                  <strong className="synonym"> {synonyms.join(", ")}</strong>
                </p>
              )}

              {antonyms.length > 0 && (
                <p className="antonym-text">
                  Antonyms
                  <strong className="antonym"> {antonyms.join(", ")}</strong>
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p>
        Sources <a href={sourceUrls[0]}>{sourceUrls[0]}</a>
      </p>
    </>
  );
};

const AudioStateMessage = function ({ audioState }) {
  return (
    <p className={`audio-state-message ${audioState ? "hidden" : ""}`}>
      no audio for searched word
    </p>
  );
};
