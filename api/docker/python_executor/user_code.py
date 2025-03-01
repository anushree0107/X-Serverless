import numpy as np
from scipy.linalg import solve
from scipy.fft import fft, ifft
from scipy.optimize import minimize

# Create random matrices
A = np.random.rand(3, 3)
B = np.random.rand(3, 3)
C = np.random.rand(3, 3)

# Matrix operations
result_add = np.add(A, B)
result_sub = np.subtract(A, B)
result_mul = np.dot(A, B)
result_elementwise_mul = np.multiply(A, B)
result_inv = np.linalg.inv(A)

# Solving a system of linear equations: Ax = B
x = solve(A, B)

# Fourier transform
x_signal = np.random.rand(10)
X_freq = fft(x_signal)
x_reconstructed = ifft(X_freq)

# Optimization: minimize a quadratic function
fun = lambda x: x[0]**2 + x[1]**2 + 1
res = minimize(fun, [2, 2], method='BFGS')

# Print the results
print('Matrix A:\n', A)
print('Matrix B:\n', B)
print('Matrix C:\n', C)
print('Matrix addition (A + B):\n', result_add)
print('Matrix subtraction (A - B):\n', result_sub)
print('Matrix multiplication (A * B):\n', result_mul)
print('Element-wise multiplication (A * B):\n', result_elementwise_mul)
print('Inverse of Matrix A:\n', result_inv)
print('Solution of Ax = B:\n', x)
print('Original signal:\n', x_signal)
print('Fourier Transform of the signal:\n', X_freq)
print('Reconstructed signal from Fourier Transform:\n', x_reconstructed)
print('Optimization result:\n', res)