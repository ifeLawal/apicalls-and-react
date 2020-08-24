import React, { useState } from 'react';
import useFetchJobs from './useFetchJobs.js'
import { Container } from 'react-bootstrap'

function App() {

  const { jobs, loading, error } = useFetchJobs();

  return (
    <Container>
      {loading && <h1>Loading...</h1>}
      {error && <h1>Error. Try refreshing.</h1>}
      {!loading && !error && <h1>{jobs.length}</h1>}
    </Container>
  );
}

export default App;
