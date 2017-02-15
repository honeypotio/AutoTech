const assert = require('assert');
const companies = require('../data/autotech.json');

describe('#Data Purity', () => {
  it('No duplicate data', function() {
    let companyNames = companies.map(company => company.name);
    let uniqueCompanyNames = [...new Set(companyNames)];
    assert.equal(companyNames.length, uniqueCompanyNames.length);
  });

  it('No missing company data', function() {
    let companyNames = companies.map(company => company.name);
    let relationships = ["mentoredBy", "foundedBy", "investedBy", "acquiredBy", "partneredWith", "mentors", "founded", "investedIn", "acquired"];
    let linkedCompanies = companies.reduce((nameList, company) => {
      relationships.forEach(rel => {
        if (company[rel]) {
          company[rel].forEach(linkedCompany => {
            if (nameList.indexOf(linkedCompany) === -1) {
              nameList.push(linkedCompany);
            }
          });
        }
      });
      return nameList;
    }, []);
    
    assert.equal(companyNames.length, linkedCompanies.length);
  });

  it('All relationships are two way', function() {
    const mapping = {
      "mentoredBy": "mentors",
      "foundedBy": "founded",
      "investedBy": "investedIn",
      "acquiredBy": "acquired",
      "partneredWith": "partneredWith",
      "mentors": "mentoredBy",
      "founded": "foundedBy",
      "investedIn": "investedBy",
      "acquired": "acquiredBy"
    };

    const companiesHash = companies.reduce((acc, curr) => {
      acc[curr.name] = curr;
      return acc;
    }, {});

    companies.forEach(company => {
      let relationshipKeys = Object.keys(company).filter(key => key !== "name");

      relationshipKeys.forEach(relationship => {
        company[relationship].forEach(relatedCompany => {
          let relatedCompanyData = companiesHash[relatedCompany];
          let reverseRelationship = mapping[relationship];

          assert.ok(relatedCompanyData, `${relatedCompany} is either missing or it's name misspelt`)
          assert.ok(relatedCompanyData[reverseRelationship], `Relationship is broken btn ${relatedCompany} and ${company.name}`);
          assert.ok(relatedCompanyData[reverseRelationship].includes(company.name), `Relationship is broken btn ${relatedCompany} and ${company.name}`);
        })
      });
    });
  });
});
