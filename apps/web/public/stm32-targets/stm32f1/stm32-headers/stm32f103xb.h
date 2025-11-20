/* STM32F103xB Device Header */
#ifndef STM32F103xB_H
#define STM32F103xB_H

/* Peripheral register structures */
typedef struct {
  volatile unsigned int CR;
  volatile unsigned int CFGR;
  volatile unsigned int CIR;
  volatile unsigned int APB2RSTR;
  volatile unsigned int APB1RSTR;
  volatile unsigned int AHBENR;
  volatile unsigned int APB2ENR;
  volatile unsigned int APB1ENR;
  volatile unsigned int BDCR;
  volatile unsigned int CSR;
} RCC_TypeDef;

typedef struct {
  volatile unsigned int CRL;
  volatile unsigned int CRH;
  volatile unsigned int IDR;
  volatile unsigned int ODR;
  volatile unsigned int BSRR;
  volatile unsigned int BRR;
  volatile unsigned int LCKR;
} GPIO_TypeDef;

/* Memory map */
#define PERIPH_BASE 0x40000000UL
#define APB2PERIPH_BASE (PERIPH_BASE + 0x00010000UL)
#define AHBPERIPH_BASE (PERIPH_BASE + 0x00020000UL)

#define RCC_BASE (AHBPERIPH_BASE + 0x00001000UL)
#define GPIOA_BASE (APB2PERIPH_BASE + 0x00000800UL)
#define GPIOB_BASE (APB2PERIPH_BASE + 0x00000C00UL)
#define GPIOC_BASE (APB2PERIPH_BASE + 0x00001000UL)

#define RCC ((RCC_TypeDef*)RCC_BASE)
#define GPIOA ((GPIO_TypeDef*)GPIOA_BASE)
#define GPIOB ((GPIO_TypeDef*)GPIOB_BASE)
#define GPIOC ((GPIO_TypeDef*)GPIOC_BASE)

/* RCC register bits */
#define RCC_APB2ENR_IOPAEN (1UL << 2)
#define RCC_APB2ENR_IOPBEN (1UL << 3)
#define RCC_APB2ENR_IOPCEN (1UL << 4)

/* GPIO register bits */
#define GPIO_CRH_MODE13 (3UL << 20)
#define GPIO_CRH_MODE13_1 (2UL << 20)
#define GPIO_CRH_CNF13 (3UL << 22)
#define GPIO_ODR_ODR13 (1UL << 13)

#endif
