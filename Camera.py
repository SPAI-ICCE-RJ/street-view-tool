import numpy as np
import cv2
from collections import defaultdict
from scipy.stats import t, norm
from scipy.optimize import root_scalar
from scipy.optimize import minimize
import os

caso="ICCE"

# Defina o número de pontos iniciais que serão excluídos para a calibração
n_heights = 1

# Defina o valor do padding desejado 
padding_x,padding_y = 100,100

# Chute inicial para os coeficientes de distorção
dist_coeffs0 = np.array([[0], [0],                 # k1, k2 
                         [0], [0],                 # p1, p2
                         [0], [0], [0],[0],        # k3, k4, k5, k6
                         [0],[0],[0],[0],          # s1, s2, s3, s4 (thin prism) 
                         [0],[0]],                 # tau1, tau2 (tilted)
                        dtype=np.float32)

# -----------------------------------------------------------
# 🔹 MODELO DE DISTORÇÃO
# -----------------------------------------------------------
use_rational_model    = False  # habilita k4, k5, k6
use_thin_prism_model  = False
use_tilted_model      = False

# -----------------------------------------------------------
# 🔹 COEFICIENTES A FIXAR
# -----------------------------------------------------------
fix_p1_p2             = True
fix_k1                = False
fix_k2                = False
fix_k3                = False
fix_k4                = False
fix_k5                = False
fix_k6                = False

# -----------------------------------------------------------
# 🔹 INTRÍNSECOS / OUTROS
# -----------------------------------------------------------
fix_aspect_ratio      = False
fix_principal_point   = True
fix_focal_length      = False

# ===========================================================
# APLICAÇÃO DOS FLAGS AO CALIBRADOR
# ===========================================================

flags_set = 0
flags_set |= cv2.CALIB_USE_INTRINSIC_GUESS
if use_rational_model:
    flags_set |= cv2.CALIB_RATIONAL_MODEL
if use_thin_prism_model:
    flags_set |= cv2.CALIB_THIN_PRISM_MODEL
if use_tilted_model:
    flags_set |= cv2.CALIB_TILTED_MODEL
if fix_p1_p2:
    flags_set |= cv2.CALIB_FIX_TANGENT_DIST
if fix_k1:
    flags_set |= cv2.CALIB_FIX_K1
if fix_k2:
    flags_set |= cv2.CALIB_FIX_K2
if fix_k3:
    flags_set |= cv2.CALIB_FIX_K3
if fix_k4:
    flags_set |= cv2.CALIB_FIX_K4
if fix_k5:
    flags_set |= cv2.CALIB_FIX_K5
if fix_k6:
    flags_set |= cv2.CALIB_FIX_K6
if fix_aspect_ratio:
    flags_set |= cv2.CALIB_FIX_ASPECT_RATIO
if fix_principal_point:
    flags_set |= cv2.CALIB_FIX_PRINCIPAL_POINT
if fix_focal_length:
    flags_set |= cv2.CALIB_FIX_FOCAL_LENGTH


# Função para adicionar padding à imagem
def pad_image(img, pad_x, pad_y):
    return cv2.copyMakeBorder(img, pad_y, pad_y, pad_x, pad_x, cv2.BORDER_CONSTANT, value=(255, 255, 255))

# Variáveis globais para marcação e zoom/pan
drag_start = None
dragging = False
zoom = 0.1
zoom_step = 0.1   
min_zoom = 0.1 
max_zoom = 5.0
offset = np.array([0, 0], dtype=np.int32)
pontos_clicados = []  # Armazena os cliques para BASE e TOPO
  
# Variáveis globais para as dimensões atuais da imagem e da janela
current_img_w = 0  
current_img_h = 0
current_win_width = 0
current_win_height = 0

# Input: valor desejado da PDF da t-Student
y_target = 1e-5  # Exemplo: defina o valor que desejar

n_values = np.arange(1, 50)  # n de 2 a 31
k_values = []

for n in n_values:
    nu = n - 1  # graus de liberdade
    
    # Passo 1: Encontrar x onde PDF_t(x, nu) = y_target
    def equation_t(x):
        return t.pdf(x, df=nu) - y_target
    
    try:
        # Encontre x > 0 onde a PDF_t atinge y_target
        sol_x = root_scalar(equation_t, bracket=[0, 2000], method='brentq')
        x_crit = sol_x.root
    except ValueError:
        # Se não houver solução (y_target maior que o pico da PDF) 
        k_values.append(np.nan)
        continue
    
    # Passo 2: Encontrar k tal que PDF_normal(x_crit, k) = y_target
    def equation_k(k):
        return norm.pdf(x_crit, scale=k) - y_target
    
    try:
        sol_k = root_scalar(equation_k, bracket=[0.1, 1000], method='brentq')
        k_values.append(sol_k.root)
    except ValueError:
        k_values.append(np.nan)
print("k_values:", k_values)
 
# Função para ler o arquivo e agrupar os pontos pela id (primeira coluna)
def ler_dados_txt_multi(filepath):
    object_points_dict = defaultdict(list)
    image_points_dict = defaultdict(list)
    extra_data_dict = defaultdict(list)  # Para as duas colunas extras
    with open(filepath, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            partes = line.replace(",", ".").split(";")
            if len(partes) < 8:
                print("Linha ignorada (formato inesperado):", line)
                continue
            id_val = partes[0].strip()
            world = [float(partes[1]), float(partes[2]), float(partes[3])]
            image = [float(partes[4]), float(partes[5])]
            extra = [float(partes[6])]
            object_points_dict[id_val].append(world)
            image_points_dict[id_val].append(image) 
            extra_data_dict[id_val].append(extra)
    print("IDs encontrados:", list(object_points_dict.keys()))
    return object_points_dict, image_points_dict, extra_data_dict

# Função auxiliar: clamp
def clamp(val, minval, maxval):
    return max(minval, min(val, maxval))

def mouse_zoom_pan(event, x, y, flags, param):
    global zoom, offset, drag_start, dragging, current_win_width, current_win_height, current_img_w, current_img_h, pontos_clicados
    if event == cv2.EVENT_LBUTTONDOWN:
        drag_start = (x, y)
        dragging = False
    elif event == cv2.EVENT_MOUSEMOVE and drag_start is not None:
        dx = x - drag_start[0]
        dy = y - drag_start[1]
        if abs(dx) >= 2 or abs(dy) >= 2:
            dragging = True
            offset[0] -= dx
            offset[1] -= dy
            drag_start = (x, y)
    elif event == cv2.EVENT_LBUTTONUP:
        if not dragging and len(pontos_clicados) < 2*(n_heights+1):
            # de forma global, registramos as coordenadas relativas:
            pt_x = int((x + offset[0]) / zoom)
            pt_y = int((y + offset[1]) / zoom)
            pontos_clicados.append((pt_x, pt_y))
        drag_start = None
        dragging = False
    elif event == cv2.EVENT_MOUSEWHEEL:
        # Atualiza o zoom mantendo a posição relativa do ponteiro
        if flags > 0:
            zoom_new = clamp(zoom + zoom_step, min_zoom, max_zoom)
        else:
            zoom_new = clamp(zoom - zoom_step, min_zoom, max_zoom)
        mx, my = x, y
        ox, oy = offset[0], offset[1]
        # Ajusta o offset para que o ponto sob o ponteiro permaneça fixo
        new_offset_x = int((ox + mx) * zoom_new / zoom - mx)
        new_offset_y = int((oy + my) * zoom_new / zoom - my)
        max_offset_x = max(0, int(current_img_w * zoom_new) - current_win_width)
        max_offset_y = max(0, int(current_img_h * zoom_new) - current_win_height)
        offset[0] = clamp(new_offset_x, 0, max_offset_x)
        offset[1] = clamp(new_offset_y, 0, max_offset_y)
        zoom = zoom_new

def mostrar_zoom_pan_marking():
    global zoom, offset, current_win_width, current_win_height, current_img_w, current_img_h, pontos_clicados
    window_name = "Zoom/Pan - Marque o topo"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.setMouseCallback(window_name, mouse_zoom_pan)
    cv2.setWindowProperty(window_name, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
    
    # Use uma cópia da imagem para marcação

    base_img = image.copy()
    current_img_h, current_img_w = base_img.shape[:2]
    
    # Configurar zoom inicial baseado na janela atual
    rect = cv2.getWindowImageRect(window_name)
    if rect is not None:
        _, _, win_width, win_height = rect
        current_win_width, current_win_height = win_width, win_height
        zoom = min(win_width / float(current_img_w), win_height / float(current_img_h))
        if zoom < min_zoom:
            zoom = min_zoom
    else:
        current_win_width, current_win_height = 800, 600
        
    offset = np.array([0, 0], dtype=np.int32)
    
    while len(pontos_clicados) < 2*(n_heights+1):
        rect = cv2.getWindowImageRect(window_name)
        if rect is None:
            break
        _, _, win_width, win_height = rect
        current_win_width, current_win_height = win_width, win_height

        # Redimensiona a imagem de marcação de acordo com o zoom
        zoomed_w = int(current_img_w * zoom)
        zoomed_h = int(current_img_h * zoom)
        zoomed = cv2.resize(base_img, (zoomed_w, zoomed_h), interpolation=cv2.INTER_LINEAR)
        
        # Calcula a região visível com base no offset
        x0 = clamp(offset[0], 0, max(0, zoomed_w - current_win_width))
        y0 = clamp(offset[1], 0, max(0, zoomed_h - current_win_height))
        view = zoomed[y0:y0+current_win_height, x0:x0+current_win_width].copy()
        #cv2.imshow(window_name, view)
        #if cv2.waitKey(10) != -1:
           #     break
        
        
        # Desenhar os pontos já marcados na view (convertendo as coordenadas)
        for i, p in enumerate(pontos_clicados):
            x_draw = int(p[0] * zoom) - x0
            y_draw = int(p[1] * zoom) - y0
            if i % 2 == 0:
                # Desenha uma cruz verde para o primeiro ponto
                cor = (0, 255, 0)
                tamanho = 12
                espessura = 3 
                cv2.line(view, (x_draw - tamanho, y_draw - tamanho), (x_draw + tamanho, y_draw + tamanho), cor, espessura)
                cv2.line(view, (x_draw - tamanho, y_draw + tamanho), (x_draw + tamanho, y_draw - tamanho), cor, espessura)
            else:
                # Amarelo para o segundo ponto (círculo)
                cv2.circle(view, (x_draw, y_draw), 12, (0, 255, 255), 3)
        cv2.imshow(window_name, view)
                
        if cv2.waitKey(10) != -1:
                break
    cv2.destroyWindow(window_name)

# Função iterativa para estimar a altura
def calcular_altura_iterativa(camera_matrix, dist_coeffs, rvec, tvec, base_mundo, base_imagem, topo_imagem):
    un_topo_im = cv2.undistortPoints(
           topo_imagem, camera_matrix, dist_coeffs, P=None
        )[0][0]
    un_base_im = cv2.undistortPoints(
           base_imagem, camera_matrix, dist_coeffs, P=None
        )[0][0]
  
    R, _ = cv2.Rodrigues(rvec)  # rvec da calibração
    C = (-R.T @ tvec).ravel()  # Posição da câmera no mundo (3x1)

    V_t = np.array([un_topo_im[0], un_topo_im[1], 1])
    V_t = (R.T @ V_t).ravel()

    V_b = np.array([un_base_im[0], un_base_im[1], 1])
    V_b = (R.T @ V_b).ravel()


    def erro(vars):
        t, z = vars
        base_mundo_optm = C+np.array([V_t[0]*t, V_t[1]*t, z], dtype=np.float32)
        dist_bm = np.linalg.norm(base_mundo_optm - base_mundo)
        dist_bi = np.linalg.norm(np.cross(base_mundo_optm -C, V_b)) / np.dot(V_b, V_b)
        return dist_bi+dist_bm


    bounds = [(-30, 30), (-3, 3)]
    res = minimize(erro, x0=[0, -2], bounds=bounds, method='Powell')  
 
    topo_mundo=C+np.array([V_t[0]*res.x[0], V_t[1]*res.x[0],res.x[0]*V_t[2]], dtype=np.float32)   
    base_mundo_opt= C+np.array([V_t[0]*res.x[0], V_t[1]*res.x[0], res.x[1]], dtype=np.float32)

    base_marcada=C+(np.linalg.norm(np.dot(base_mundo_opt-C, V_b)) / np.dot(V_b, V_b))*V_b
 
    erro_base=(abs(base_mundo[2]-base_marcada[2])+(np.dot(base_mundo[:2]-base_marcada[:2],topo_mundo[:2]-C[:2])/np.dot(topo_mundo[:2]-C[:2],topo_mundo[:2]-C[:2]))*topo_mundo[2]/np.linalg.norm(topo_mundo[:2]-C[:2]))/2

    altura = np.linalg.norm(topo_mundo - base_mundo_opt)


    projected_point, _ = cv2.projectPoints(
        np.array(topo_mundo, dtype=np.float32), rvec, tvec, camera_matrix, dist_coeffs
    )

    return altura, topo_mundo, base_mundo_opt, projected_point, erro_base

      
# INÍCIO DO PROCESSAMENTO

# Carregar uma única imagem (usada para todos os ids) 
image = cv2.imread(f'Python/{caso}/Questionado.png')

if image is None:
    raise ValueError("Erro ao carregar a imagem.")
print("Imagem carregada com sucesso! Dimensões:", image.shape) 
image_size = (image.shape[1], image.shape[0])

# Carregar Referência (usada para todos os ids) 
imageRef = cv2.imread(f'Python/{caso}/Referencia.png')
if imageRef is None:
    raise ValueError("Erro ao carregar a imagem.")
print("Imagem carregada com sucesso! Dimensões:") 

os.makedirs(f'Python/{caso}/Results/Seq1', exist_ok=True)
os.makedirs(f'Python/{caso}/Results/Seq2', exist_ok=True)
os.makedirs(f'Python/{caso}/Results/Seq3', exist_ok=True) 

# Ler os pontos do arquivo e agrupar por id
object_points_dict, image_points_dict, extra_data_dict = ler_dados_txt_multi(f"Python/{caso}/dados.txt")

idn=0

# Para cada id, realizar calibração, usando os pontos a partir de n_heights:
for id_val in object_points_dict: 
    print(f"\n=== Processando id: {id_val} ===")
    # Converter todos os pontos para arrays
    object_points = np.array(object_points_dict[id_val][:], dtype=np.float32)
    image_points = np.array(image_points_dict[id_val][:], dtype=np.float32)
    extra_data = np.array(extra_data_dict[id_val][:], dtype=np.float32)

    if object_points.shape[0] - n_heights < 4:
        print(f"Ignorando id {id_val}: número de pontos ({object_points.shape[0]}) insuficiente após exclusão.")
        continue
 
    # Use os pontos a partir de index n_heights para a calibração  
    object_points_calib = object_points[n_heights:]
    image_points_calib = image_points[n_heights:]
    

    # Calibração com os pontos restantes
    camera_matrix = np.array([
        [image_size[0]//2, 0, image_size[0]//2 ],
        [0, image_size[1]//2, image_size[1]//2 ],
        [0, 0, 1]
    ], dtype=np.float32)
    object_points_list = [object_points_calib]
    image_points_list = [image_points_calib]
    ret, camera_matrix, dist_coeffs, rvecs, tvecs = cv2.calibrateCamera(
        object_points_list, image_points_list, image_size,
        camera_matrix, dist_coeffs0, flags=flags_set
    )


    if not ret:
        print(f"Erro na calibração para id {id_val}.")
        continue
    

    image_undistorted = cv2.undistort(image, camera_matrix, dist_coeffs)
    image_with_points = image_undistorted.copy()

    # Projetar os pontos 3D para conferência
    projected_points, _ = cv2.projectPoints(object_points_calib, rvecs[0], tvecs[0], camera_matrix, dist_coeffs)
    projected_points_2d = projected_points.reshape(-1, 2)

    # Calcular o erro de reprojeção
    erros = np.linalg.norm(np.array(image_points_calib) - projected_points_2d, axis=1)
    erro_medio = np.mean((erros)**2)**0.5

    # Criar uma cópia da imagem para sobreposição
    img_proj = imageRef.copy()

    # Desenhar os pontos originais medidos (em azul)
    for pt in np.array(image_points_calib, dtype=np.float32):
        x, y = int(pt[0]), int(pt[1])
        tamanho = 7
        espessura = 2
        cor = (255, 0, 0)  # Azul em BGR
        cv2.line(img_proj, (x - tamanho, y), (x + tamanho, y), cor, espessura)
        cv2.line(img_proj, (x, y - tamanho), (x, y + tamanho), cor, espessura)

    # Desenhar os pontos reprojetados (em vermelho)
    for pt in projected_points_2d:
        cv2.circle(img_proj, (int(pt[0]), int(pt[1])), 5, (0, 0, 255), 2)  # Vermelho: (B,G,R)

    # Redimensionar a imagem para caber na tela (largura máxima de 800 pixels)
    max_width = 800
    h, w = img_proj.shape[:2]
    scale_factor = max_width / w if w > max_width else 1.0
    img_proj_small = cv2.resize(img_proj, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_AREA)

    # (Dentro do loop de exibição da projeção)

    window_name = f"Reprojected - {id_val}"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.setMouseCallback(window_name, mouse_zoom_pan)
    cv2.setWindowProperty(window_name, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

    # Atualiza as dimensões da imagem base (para reprojeção)
    current_img_h, current_img_w = img_proj.shape[:2]

    # Ajustar o zoom inicial para exibir a imagem inteira, se desejar:
    rect = cv2.getWindowImageRect(window_name)  # (x, y, win_width, win_height)
    if rect is not None:
        _, _, win_width, win_height = rect
        current_win_width, current_win_height = win_width, win_height
        zoom = min(win_width / float(current_img_w), win_height / float(current_img_h))
        if zoom < min_zoom:
            zoom = min_zoom

    while True:
        rect = cv2.getWindowImageRect(window_name)
        if rect is None:
            break  # janela fechada
        _, _, win_width, win_height = rect
        current_win_width, current_win_height = win_width, win_height

        # Redimensionar (zoom) a imagem base de projeção
        zoomed_w = int(current_img_w * zoom)
        zoomed_h = int(current_img_h * zoom)
        zoomed = cv2.resize(img_proj, (zoomed_w, zoomed_h), interpolation=cv2.INTER_AREA)    
        
       # Calcular a região exibida (usando offset)
        x0 = clamp(offset[0], 0, max(0, zoomed_w - current_win_width))
        y0 = clamp(offset[1], 0, max(0, zoomed_h - current_win_height))
        view = zoomed[y0:y0+current_win_height, x0:x0+current_win_width].copy()
           
        
        cv2.imshow(window_name, view)
        if cv2.waitKey(10) != -1:
            break
    cv2.imwrite(f"Python/{caso}/Results/Seq1/frame{idn}.jpg", view)

    img_questionada = image.copy()
    for idx in range(0, n_heights):
        pt3d = object_points[idx]
        pt_proj, _ = cv2.projectPoints(pt3d.reshape(1, 3), rvecs[0], tvecs[0], camera_matrix, dist_coeffs)
        x, y = int(pt_proj[0][0][0]), int(pt_proj[0][0][1])
        # Desenha um círculo amarelo para cada ponto
        cv2.circle(img_questionada, (x, y), 8, (0, 255, 255), 2)
        # Opcional: coloca o número do ponto
        cv2.putText(img_questionada, f"{idx}", (x + 10, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    #window_name = f"Pontos Excluídos - ID {id_val}"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.imshow(window_name, img_questionada)
    cv2.waitKey(0)
    cv2.destroyWindow(window_name)
    idn+=1

 

# Após a calibração de cada id, por exemplo:
resultados_por_id = {}  # dicionário: id_val -> list de (altura, erro_total_cm) para os pontos excluídos

print("Agora, marque o TOPO usando o mouse (zoom, pan, etc).")
# A função abaixo abre uma janela onde o usuário marca o topo.
mostrar_zoom_pan_marking()
# Após a marcação, presume-se que pontos_clicados[1] foi definido no callback
#base_imagem = base_point_2d[0][0]  # posição 2D da base (projetada)
        
idn=0

for id_val in object_points_dict:
    print(f"\n=== Processando id: {id_val} ===")
    # Converter todos os pontos para arrays
    object_points = np.array(object_points_dict[id_val][:], dtype=np.float32)
    image_points = np.array(image_points_dict[id_val][:], dtype=np.float32)
    image_points += np.array([padding_x, padding_y], dtype=np.float32)
    extra_data = np.array(extra_data_dict[id_val][:], dtype=np.float32)

    if object_points.shape[0] - n_heights < 4:
        print(f"Ignorando id {id_val}: número de pontos ({object_points.shape[0]}) insuficiente após exclusão.")
        continue

    # Use os pontos a partir do índice n_heights para a calibração
    object_points_calib = object_points[n_heights:]
    image_points_calib = image_points[n_heights:]
    extra_data_calib = extra_data[n_heights:]

    image_pad = pad_image(image, padding_x, padding_y)
    image_size = (image_pad.shape[1], image_pad.shape[0])

    
    # Calibração com os pontos restantes
    camera_matrix = np.array([
        [(image_size[0]//2-padding_x), 0, image_size[0] // 2],
        [0, (image_size[1]//2-padding_y), image_size[1] // 2],
        [0, 0, 1]
    ], dtype=np.float32)
    object_points_list = [object_points_calib]
    image_points_list = [image_points_calib]
    ret, camera_matrix, dist_coeffs, rvecs, tvecs = cv2.calibrateCamera(
        object_points_list, image_points_list, image_size,
        camera_matrix, dist_coeffs0, flags=flags_set
    )
    if not ret:
        print(f"Erro na calibração para id {id_val}.")
        continue

       
    image_pad_Ref = pad_image(imageRef, padding_x, padding_y)
    # Undistorta a imagem e cria uma cópia para marcação
    image_undistorted = cv2.undistort(image_pad, camera_matrix, dist_coeffs)
    
    image_with_points = image_undistorted.copy()
    imageRef_undistorted = cv2.undistort(image_pad_Ref, camera_matrix, dist_coeffs)

    imageRef_with_points = imageRef_undistorted.copy()


    R, _ = cv2.Rodrigues(rvecs[0])
    camera_position = -R.T @ tvecs[0]  # shape (3,1)
    erros_percentuais = []
    d_cameras=[]
    erros_pixel = []

    for i, (pt3d, pt2d,err_c) in enumerate(zip(object_points_calib, image_points_calib,extra_data_calib)):
                # Projeta o ponto 3D para a imagem
        proj, _ = cv2.projectPoints(pt3d.reshape(1, 3), rvecs[0], tvecs[0], camera_matrix, dist_coeffs)
        proj = proj[0][0]
       
        dist_m = np.linalg.norm(pt3d - camera_position.ravel())

        # Converte erro de pixel para metros usando a razão pixel/mundo na profundidade do ponto
        
        # Corrige a distorção de proj e pt2d
        proj = cv2.undistortPoints(
            np.array([[proj]], dtype=np.float32), camera_matrix, dist_coeffs, P=None
        )[0][0]
        pt2d = cv2.undistortPoints(
            np.array([[pt2d]], dtype=np.float32), camera_matrix, dist_coeffs, P=None
        )[0][0]

        erro_pixel = np.linalg.norm(proj - pt2d)
        
        # Aproximação: 1 pixel corresponde a z/fx metros no eixo x
        erro_pct = (erro_pixel**2+(err_c/(dist_m))**2)**0.5

        erros_pixel.append(erro_pixel)
        # Erro percentual
        erros_percentuais.append(erro_pct)
        d_cameras.append(dist_m)


    # Supondo que erro_pct_medio já foi calculado:
    n_points=(object_points.shape[0] - n_heights)
    erro_pct_medio = k_values[n_points-4]* np.sqrt((n_points/(n_points-1)*np.mean(np.square(erros_percentuais))))   # transforma % em fração
    
    print(erro_pct_medio)

    rho = np.corrcoef(np.ravel(erros_pixel) * np.ravel(d_cameras), np.ravel(d_cameras))[0, 1]
    # --- Processa cada ponto excluído (0 a n_heights-1) ---
    resultados = []  # armazenará (altura, erro_total_cm) para cada ponto excluído deste id

    acquisicoes = []  # para armazenar [(base_point_2d, topo_point_2d), ...] em coordenadas da imagem undistort

    print(f"\nResultados para id {id_val}:")
    for idx in range(n_heights+1):
        # Use o ponto excluído como BASE
        base_mundo = object_points[idx]  # ponto 3D da base
       
       
        #x_base, y_base = base_point_2d[0][0]  # posição 2D da base (projetada)
        # Registre o clique da base a partir do ponto corrigido
        #pontos_clicados = [(int(round(x_base)), int(round(y_base)))]

        base_imagem = np.array(pontos_clicados[2*idx+1], dtype=np.float32) + np.array([padding_x, padding_y], dtype=np.float32)# posição 2D da base (projetada)
        topo_imagem = np.array(pontos_clicados[2*idx+0], dtype=np.float32) + np.array([padding_x, padding_y], dtype=np.float32)# posição 2D do topo (projetada)

        # Calcular a altura e obter o topo em mundo
        altura, topo_mundo, base_mundo, topo_point_2d, erro_marca_base = calcular_altura_iterativa(
            camera_matrix, dist_coeffs, rvecs[0], tvecs[0],
            base_mundo, base_imagem, topo_imagem
        )
        base_point_2d, _ = cv2.projectPoints(base_mundo.reshape(1, 3), rvecs[0], tvecs[0], camera_matrix, dist_coeffs)

        
        base_pt = base_point_2d[0][0]
        topo_pt = topo_point_2d[0][0]
        acquisicoes.append((base_pt, topo_pt))
       
        # Distância da base e do topo até a câmera (em metros)
        dist_base = np.linalg.norm(base_mundo - camera_position.ravel())
        dist_topo = np.linalg.norm(topo_mundo - camera_position.ravel())

        # Erro absoluto em metros baseado em erro_pct_medio
        erro_base_m = erro_pct_medio * dist_base
        erro_topo_m = erro_pct_medio * dist_topo
       
        # Soma euclidiana dos erros (em cm)
        sigma_var = (erro_base_m+erro_topo_m)/2
        sigma_ind= 2*((extra_data[idx][0]**2+erro_marca_base**2)**0.5)/(6**0.5)

        resultados.append((altura, sigma_var,sigma_ind))
        print(f"  Altura {idx+1}: {100*altura:.1f} cm, Sigma dependente: {100*sigma_var:.1f} cm, Sigma Independente: {100*sigma_ind:.1f} cm")
    resultados_por_id[id_val] = resultados
    

    # Continue com o restante do processamento para este id, se necessário...

    img_to_show = image_undistorted.copy()
    imgRef_to_show = imageRef_undistorted.copy()
    # Traça as retas e marca os pontos:
    for idx, (base_pt, topo_pt) in enumerate(acquisicoes):
        
        # Corrige os pontos para o sistema da imagem undistort
        base_pt_corr = cv2.undistortPoints(
            np.array([[base_pt]], dtype=np.float32), camera_matrix, dist_coeffs, P=camera_matrix
        )[0][0]
        topo_pt_corr = cv2.undistortPoints(
            np.array([[topo_pt]], dtype=np.float32), camera_matrix, dist_coeffs, P=camera_matrix
        )[0][0]

        
        if idx == len(acquisicoes) - 1:
            # Desenha a reta entre base e topo corrigidos
            cv2.line(imgRef_to_show,
                    (int(round(base_pt_corr[0])), int(round(base_pt_corr[1]))),
                     (int(round(topo_pt_corr[0])), int(round(topo_pt_corr[1]))),
                     (0, 255, 0), 2)
            # Marca o ponto base (círculo azul)
            cv2.circle(imgRef_to_show, (int(round(base_pt_corr[0])), int(round(base_pt_corr[1]))),
                       2, (255, 0, 0), -1)
            # Marca o ponto topo (círculo vermelho)
            cv2.circle(imgRef_to_show, (int(round(topo_pt_corr[0])), int(round(topo_pt_corr[1]))),
                       2, (0, 0, 255), -1)
        else:
            # Desenha a reta entre base e topo corrigidos
            cv2.line(img_to_show,
                    (int(round(base_pt_corr[0])), int(round(base_pt_corr[1]))),
                     (int(round(topo_pt_corr[0])), int(round(topo_pt_corr[1]))),
                     (0, 255, 0), 2)
            # Marca o ponto base (círculo azul)
            cv2.circle(img_to_show, (int(round(base_pt_corr[0])), int(round(base_pt_corr[1]))),
                       2, (255, 0, 0), -1)
            # Marca o ponto topo (círculo vermelho)
            cv2.circle(img_to_show, (int(round(topo_pt_corr[0])), int(round(topo_pt_corr[1]))),
                       2, (0, 0, 255), -1)

        # Exibe a imagem final resultante para o ID


    
    window_corrigida = f"Pontos Corrigidos (Undistort) - ID {id_val}"
    cv2.namedWindow(window_corrigida, cv2.WINDOW_NORMAL)
    cv2.imshow(window_corrigida, img_to_show)
    cv2.waitKey(0)
    cv2.imwrite(f"Python/{caso}/Results/Seq2/frame{idn}.jpg",  img_to_show)

    cv2.destroyWindow(window_corrigida)

    window_corrigida = f"Referência (Undistort) - ID {id_val}"
    cv2.namedWindow(window_corrigida, cv2.WINDOW_NORMAL)
    cv2.imshow(window_corrigida, imgRef_to_show)
    cv2.waitKey(0)
    cv2.destroyWindow(window_corrigida)
    cv2.imwrite(f"Python/{caso}/Results/Seq3/frame{idn}.jpg",  imgRef_to_show)
    idn += 1
  # imagem undistort já disponível


medias = []
incertezas = []

# Exibe os resultados finais para cada id
for id_val, res in resultados_por_id.items():
    print(f"\nResultados para id {id_val}:")
    
    res_util = res[:-1]

    alturas = []
    sigmas_indep = []
    sigmas_var = []

    for idx, (alt, sigma_v, sigma_i) in enumerate(res_util):
        alturas.append(alt) 
        sigmas_indep.append(sigma_i)
        sigmas_var.append(sigma_v)

    # Combinação considerando covariância total, exceto o último
    x = np.array(alturas)
    s_indep = np.array(sigmas_indep)
    s_var = np.array(sigmas_var)

    n = len(x)
    Sigma = np.zeros((n, n))

    for i in range(n):
        for j in range(n):
            if i == j:
                Sigma[i, j] = s_indep[i]**2 + s_var[i]**2
            else:
                Sigma[i, j] = rho * s_var[i] * s_var[j]

    Sigma_inv = np.linalg.inv(Sigma)
    ones = np.ones(n)
    numerador = ones @ Sigma_inv @ x
    denominador = ones @ Sigma_inv @ ones

    media_combinada = numerador / denominador
    incerteza_combinada = np.sqrt(1 / denominador)
    medias.append(media_combinada)
    incertezas.append(incerteza_combinada)

    print(f"\n  ➤ Altura combinada: {100*media_combinada:.1f} cm ± {100*incerteza_combinada:.2f} cm")

# Combinação final entre todos os id_val
pesos = 1 / np.square(incertezas)
media_final = np.sum(pesos * np.array(medias)) / np.sum(pesos)
incerteza_final = np.sqrt(1 / np.sum(pesos))

print(f"\n=== VALOR FINAL COMBINADO ENTRE TODOS OS ID ===")
print(f"  ➤ Altura final combinada: {100*media_final:.1f} cm ± {100*incerteza_final:.2f} cm")

medias = []
incertezas = []

for id_val, res in resultados_por_id.items():
    # ...cálculo padrão...
    # (mantém seu código atual)

# --- Altura da referência (usando apenas res[-1] de cada id) ---
    alturas_ref = []
    sigmas_ref = []

    for id_val, res in resultados_por_id.items():
        altura_ref, sigma_v_ref, sigma_i_ref = res[-1]
        # Combina as incertezas (dependente + independente) em quadratura
        sigma_ref = np.sqrt(sigma_v_ref**2 + sigma_i_ref**2)
        alturas_ref.append(altura_ref)
        sigmas_ref.append(sigma_ref)

# Combinação ponderada das alturas de referência
pesos_ref = 1 / np.square(sigmas_ref)
media_ref = np.sum(pesos_ref * np.array(alturas_ref)) / np.sum(pesos_ref)
incerteza_ref = np.sqrt(1 / np.sum(pesos_ref))

print(f"\nVALOR FINAL DA REFERÊNCIA ENTRE TODOS OS ID")
print(f"  ➤ Altura da referência: {100*media_ref:.1f} cm ± {100*incerteza_ref:.2f} cm")
