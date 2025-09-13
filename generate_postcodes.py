import pgeocode
import pandas as pd

# instanciar para Países Baixos
nomi = pgeocode.Nominatim('NL')

# obter TODO o dataset embutido (PC4 + cidades + latitude/longitude)
df = nomi._postal_code_db   # DataFrame com todas as linhas do banco embutido

# ver colunas disponíveis
print(df.columns)

# por exemplo, selecionar apenas código postal + cidade + província
subset = df[['postal_code','place_name','province_name']]

# salvar para CSV e importar no seu Supabase
subset.to_csv('netherlands_postcodes.csv', index=False)