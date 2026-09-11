# Lounaslista

Tyylikäs, responsiivinen selainpohjainen lounaslistasovellus. Se kokoaa suosikkiravintolat, päivän annokset ja aukioloajat yhdelle näkymälle.

## Käyttö

1. Avaa `index.html` selaimessa tai julkaise repositorio GitHub Pagesissa.
2. Lisää omia ravintoloita **Lisää ravintola** -painikkeella.
3. Tallenna kiinnostavat paikat sydänpainikkeella. Valinnat säilyvät selaimen paikallisessa tallennustilassa.

## GitHub Pages

Mukana on GitHub Actions -julkaisu. Luo GitHubiin tyhjä repositorio ja suorita paikallisesti:

```bash
git remote add origin https://github.com/OMA-KAYTTAJA/lounaslista.git
git branch -M main
git add .
git commit -m "Initial Lounaslista app"
git push -u origin main
```

Valitse GitHubissa kerran **Settings → Pages → Source: GitHub Actions**. Jokainen `main`-haaraan tehty push julkaisee sovelluksen automaattisesti.

## Ruokalistojen automaattinen haku

Selain ei voi luotettavasti hakea kaikkien ravintoloiden sivuja suoraan CORS-rajoitusten vuoksi. Tuotantokäyttöön lisää palvelinpuolen rajapinta (esim. Cloudflare Worker, Vercel Function tai GitHub Action), joka hakee sallitut lähteet ja palauttaa yhtenäisen JSON-muodon. Käyttöliittymä on valmiiksi rakennettu tätä varten; nykyiset esimerkkilistat tekevät sovelluksesta heti demottavan ja käytettävän.

## Tekniikka

Ei rakennusvaihetta tai riippuvuuksia: HTML, CSS ja JavaScript. Soveltuu suoraan GitHub Pagesiin.
