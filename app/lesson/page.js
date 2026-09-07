useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  setPath(params.get("path") || "Spoken English");
}, []);
