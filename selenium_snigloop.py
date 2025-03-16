from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import pandas as pd

def download_excel(usuario, contrasena):
    chromedriver_path = "C:/Users/EmilioMachado/Downloads/chromedriver-win64/chromedriver.exe"
    #driver = webdriver.Chrome(executable_path=chromedriver_path)
    service = Service(chromedriver_path)
    driver = webdriver.Chrome(service=service)
    
    try:
        driver.get("https://www.snig.gub.uy/")
        
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "7510_login_1_field_1")))
        username = driver.find_element(By.ID, "7510_login_1_field_1")
        username.send_keys(usuario)

        password = driver.find_element(By.ID, "7510_login_1_field_2")
        password.send_keys(contrasena)
        
        login_button = driver.find_element(By.CLASS_NAME, "button-login")
        login_button.click()
        
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "I10508-240-4")))
        animales_registrados = driver.find_element(By.ID, "I10508-240-4")
        animales_registrados.click()

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "I10508-239-1")))
        animales_vivos = driver.find_element(By.ID, "I10508-239-1")
        animales_vivos.click()

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "I10508-238-4")))
        animales_todos = driver.find_element(By.ID, "I10508-238-4")
        animales_todos.click()
        
        #time.sleep(3)  # Espera para asegurar que la página ha cargado completamente

        #driver.get("https://www.snig.gub.uy/productor/nuc-trabajar-con-animales-vivos")

        WebDriverWait(driver, 10).until(
            EC.frame_to_be_available_and_switch_to_it((By.TAG_NAME, "iframe"))
        )

        excel_button = WebDriverWait(driver, 10).until(
            #EC.element_to_be_clickable((By.XPATH, "//input[@value='EXCEL']"))
            EC.element_to_be_clickable((By.XPATH, "/html/body/form/table/tbody/tr[3]/td/div/div/table/tbody/tr[2]/td/table/tbody/tr[9]/td/input[3]"))
        )
        excel_button.click()
        print("Se encontró y se clickeó en Excel.")

        #WebDriverWait(driver, 10).until(EC.number_of_windows_to_be(2))

        #for window_handle in driver.window_handles:
        #    driver.switch_to.window(window_handle)
        #    if "algún identificador único de la nueva ventana" in driver.title:
        #        break
        #try:
        WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "/html/body/form/table/tbody/tr[3]/td/div/div/table/tbody/tr/td/table/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr[10]/td[3]/input"))
        )
        print_button = driver.find_element(By.XPATH, "/html/body/form/table/tbody/tr[3]/td/div/div/table/tbody/tr/td/table/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr[10]/td[3]/input")
        print_button.click()
        print("Se encontró y se clickeó en Imprimir.")
            
        #except:
        #    print("Botón print no encontrado.")
        time.sleep(15)


    except Exception as e:
        print("Ha ocurrido un error:", e)
    finally:
        driver.quit()
def process_excel(file_path):
    # Lee el archivo Excel
    data = pd.read_excel(file_path, engine='openpyxl')
    
    # Itera sobre las filas del DataFrame
    for index, row in data.iterrows():
        #usuario = str(row['Usuario']).zfill(9) # Asumiendo que el usuario está en la columna 'A'
        usuario = row['username'] # Asumiendo que el usuario está en la columna 'A'
        contrasena = row['password']  # Asumiendo que la contraseña está en la columna 'B'
        print(f"Procesando usuario {usuario}")
        download_excel(usuario, contrasena)

if __name__ == "__main__":
    #file_path = 'C:/Users/EmilioMachado/Desktop/TRAZAFIJO/snig.xlsx'
    #file_path = 'C:/Users/EmilioMachado/Documents/depthai-python/examples/SpatialDetection/snig_passwords_filtered.xlsx'# todos
    file_path = 'C:/Users/EmilioMachado/Documents/depthai-python/examples/SpatialDetection/snig_passwords_filtered2.xlsx'# solo calpace
    process_excel(file_path)
    #download_excel()
