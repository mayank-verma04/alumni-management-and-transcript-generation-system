const mysql = require('mysql2');

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: process.env.MYSQL_PASSWORD,
//   database: "university_db",
// });

// db.connect((err) => {
//   if (err) throw err;
//   console.log("Connected to database");
// });

// ***************************************************************
// ***************************************************************
// ***************************************************************

const caCert = `
-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUE7PYNMUCfH24qzzuM6SrJtcEXoAwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvMDU4YmQ4ZmEtYTBiNy00NjJhLWI3YWMtMDk3NTZhZTNl
M2ZkIFByb2plY3QgQ0EwHhcNMjQxMTI5MTY0MTM2WhcNMzQxMTI3MTY0MTM2WjA6
MTgwNgYDVQQDDC8wNThiZDhmYS1hMGI3LTQ2MmEtYjdhYy0wOTc1NmFlM2UzZmQg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBALavGLbt
YpIiAgvAu6y2Rmd+28gsX4X9DeX92OkCdlmA+DrEhTukfljPE8jha+l3ySYhBv8h
8HYAgB5ev+V6P1gcVyhzSmk8fKQML6skwNB8bbvJy9XE0sqaFQaLhprKDrT73aKV
GPOdcqYyY4AH6+em62bdFT1B+2vcYx9Csha9S8rwVIETXeb0bigff+QpWhnHdVOn
erfMUG3RDi5lUnPsz1OACnQ+zRpLx9VMHIalkWb48PprBb52oYOrITWsg72RuMru
7zmDtSSqPhH0jo+G+vauw8g6A6jc4qcjaJ9q0QHDrah/72ZyzQps4AdnXAUOqsJ4
ebyrliGB8TXbrwhUmFaoZypwI6jASRLnVIvt+Q4YY1wZwOrjRVjmYmQ8TiG6Fq1L
NKLZUh35X1mJq1UhjJQagZbkC96VLdVakIPX2K4g35M/yvHBidqg3Mk46/w+cDV4
k9jsRa/AszKqlji8RLgb3MHSEt1DnEaJpbxdnlSYXyOGB1cX0ViXXLTq2wIDAQAB
oz8wPTAdBgNVHQ4EFgQU2K+7JpcJKZ1Ic2vobJ+E3gr+ll8wDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAHi6ne9tuyWWO/NG
f1WKRSvjxyxF5Bs+UdjUODSL9zn6JcGGGeMNT1yGjExZdFj9Vfe8asgSyNV2p4SZ
vGUnjUjvCU6mJ7+jK1d0yNQZojZu5SIKKS9KlZ69c96DVAikQUeFWBsLQ93HpZlB
0/BiY7tQW8eIfMljXyIb6twHjETOPt3LQFHrFullAf0bHNbQYTImEwCN6Vgpoqdb
yLmLVWFcNkoItSz2cMgLmxAcHiZlRmrqFztmaK/VFKLIZ3SeJLu/MMur6vgKpNk/
5IHy4XjyYn+3/2N39xUqYFwoWizf3Dc7d2zPXjo3ECRn8+IBSraQASVnFX8puB+Q
1vSe93Ic5voBgwCQV97cOMLkseJLoJMFQCuRet41AxxSjc1945Rs9UonyBExC81c
Sl69ao32TcmW1XDUs6nWerlE4VZLoPnLEPRf4MMZ0bR0PxyQ7dAo/19Hk52fvbVR
lE9Z3TBf7lsEwBiDVCfo2lo3Q/QiRNfmMv55rIFPeRI/qZQKcg==
-----END CERTIFICATE-----
`;

// Create the connection
const db = mysql.createConnection({
  host: 'universitydb-universitydb.e.aivencloud.com',
  port: 20447,
  user: 'avnadmin',
  password: 'AVNS_4FrHHfkxtA_O1TQeZf1',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: true, // Validate the SSL certificate
    ca: caCert,
  },
});

// Test the connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// ***************************************************************
// ***************************************************************
// ***************************************************************

module.exports = db;
