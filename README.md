# Lounaslista

Tyylikäs, responsiivinen selainpohjainen lounaslistasovellus. Se kokoaa suosikkiravintolat, päivän annokset ja aukioloajat yhdelle näkymälle.

## Käyttö

1. Avaa `index.html` selaimessa tai julkaise repositorio GitHub Pagesissa.
2. Lisää omia ravintoloita **Lisää ravintola** -painikkeella.
3. Tallenna kiinnostavat paikat sydänpainikkeella. Valinnat säilyvät selaimen paikallisessa tallennustilassa.
4. Valitse **Käytä sijaintiani**, jolloin sovellus hakee OpenStreetMapista aidot lähialueen ravintolat, järjestää ne etäisyyden mukaan ja tarjoaa karttahaun. Sijaintia käytetään vain selaimessasi eikä tallenneta.

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

Sovellus hakee paikkojen perustiedot OpenStreetMapista. Päivän ruokalistat eivät ole yhtenäisessä avoimessa tietolähteessä, joten sovellus ohjaa ravintolan omalle sivulle ruokalistan tarkistamista varten. Tarkempi menuintegraatio kannattaa toteuttaa palvelinpuolen rajapinnalla (esim. Cloudflare Worker tai Vercel Function) lähdekohtaisesti.

## Tekniikka

Ei rakennusvaihetta tai riippuvuuksia: HTML, CSS ja JavaScript. Soveltuu suoraan GitHub Pagesiin.
