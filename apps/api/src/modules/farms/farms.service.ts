export class FarmsService {
  getFarmById(id: string) {
    return {
      id,
      status: 'placeholder',
      source: 'farm-registry'
    };
  }
}

